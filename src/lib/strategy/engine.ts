import {
  STRATEGY_AGENT_ID,
  STRATEGY_SIMULATION_VERSION,
  assertSimulationHasNoExecutionAuthority,
  type PlayerArchetype,
  type SimulationKind,
  type StrategyCardV1,
  type StrategyFindingV1,
  type StrategyObjective,
  type StrategyRecommendationV1,
  type StrategyRunEventV1,
  type StrategySimulationReceiptV1,
  type StrategyWorldV1,
} from "../../contracts/strategy-simulation.v1.ts";
import {
  ATG_TRANSFORM_IR_VERSION,
  type AtgPropertyV1,
  type AtgTransformIrV1,
} from "../../contracts/atg-transform.v1.ts";
import type { WorkProofVideoV1 } from "../../contracts/service-enrollment.v1.ts";

export const MODEL_VERSION = STRATEGY_SIMULATION_VERSION;

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function defaultMix(): Record<PlayerArchetype, number> {
  return {
    new_player: 0.18,
    casual: 0.22,
    competitive: 0.1,
    collector: 0.08,
    completionist: 0.05,
    whale: 0.04,
    free_player: 0.1,
    community_regular: 0.06,
    live_event_participant: 0.03,
    min_maxer: 0.04,
    grinder: 0.03,
    speedrunner: 0.01,
    farmer: 0.03,
    sybil_attacker: 0.01,
    colluding_group: 0.01,
    griefer: 0.005,
    speculator: 0.015,
    creator: 0.01,
    moderator: 0.005,
  };
}

export function emptyWorld(projectId = "UNKNOWN"): StrategyWorldV1 {
  return {
    projectId,
    supply: { value: null, epistemic: "UNKNOWN", note: "Supply not provided." },
    walletLimit: { value: null, epistemic: "UNKNOWN", note: "Wallet limits not provided." },
    demand: { value: null, epistemic: "UNKNOWN", note: "Demand is not a measured fact." },
    questFirstReward: { value: null, epistemic: "UNKNOWN" },
    questRepeatReward: { value: null, epistemic: "UNKNOWN" },
    cards: { value: [], epistemic: "UNKNOWN", note: "No card definitions loaded." },
    playerCount: { value: 400, epistemic: "ASSUMPTION", note: "Population size is an assumption." },
    mix: defaultMix(),
  };
}

export function kindFor(objective: StrategyObjective): SimulationKind {
  switch (objective) {
    case "TEST_GAME":
      return "DETERMINISTIC";
    case "TEST_DROP":
      return "LAUNCH";
    case "TEST_COMMUNITY":
      return "AGENT_BASED";
    case "TEST_INCENTIVES":
      return "ECONOMY";
    default:
      return "MONTE_CARLO";
  }
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.min(items.length - 1, Math.floor(rng() * items.length))];
}

function archetypeFromMix(rng: () => number, mix: StrategyWorldV1["mix"]): PlayerArchetype {
  const entries = Object.entries(mix) as Array<[PlayerArchetype, number]>;
  const total = entries.reduce((sum, [, w]) => sum + (w ?? 0), 0) || 1;
  let cursor = rng() * total;
  for (const [id, weight] of entries) {
    cursor -= weight ?? 0;
    if (cursor <= 0) return id;
  }
  return "casual";
}

function cardChoice(card: StrategyCardV1[], archetype: PlayerArchetype, rng: () => number): StrategyCardV1 {
  if (!card.length) throw new Error("no cards");
  if (archetype === "casual" || archetype === "new_player" || archetype === "free_player") {
    return pick(rng, card);
  }
  if (archetype === "farmer" || archetype === "sybil_attacker") {
    return [...card].sort((a, b) => a.cost - b.cost || b.power - a.power)[0];
  }
  return [...card].sort((a, b) => b.power - a.power || a.cost - b.cost)[0];
}

function duel(a: StrategyCardV1, b: StrategyCardV1, rng: () => number): StrategyCardV1 {
  if (a.power !== b.power) return a.power > b.power ? a : b;
  return rng() < 0.5 ? a : b;
}

export function applyDraftChange(
  world: StrategyWorldV1,
  change: Record<string, number | string>,
): StrategyWorldV1 {
  const next = structuredClone(world);
  if (typeof change.questRepeatReward === "number") {
    next.questRepeatReward = {
      value: change.questRepeatReward,
      epistemic: "HYPOTHESIS",
      note: "Draft change pending founder approval. Not production.",
    };
  }
  if (typeof change.walletLimit === "number") {
    next.walletLimit = {
      value: change.walletLimit,
      epistemic: "HYPOTHESIS",
      note: "Draft change pending founder approval. Not production.",
    };
  }
  return next;
}

export function runSimulation(input: {
  world: StrategyWorldV1;
  objective: StrategyObjective;
  kind?: SimulationKind;
  randomSeed: string;
  numberOfRuns?: number;
  scenario?: string;
}): StrategySimulationReceiptV1 {
  const kind = input.kind ?? kindFor(input.objective);
  const runs = Math.max(1, Math.min(input.numberOfRuns ?? 240, 2000));
  const rng = mulberry32(hashSeed(input.randomSeed));
  const events: StrategyRunEventV1[] = [];
  const findings: StrategyFindingV1[] = [];
  const recommendations: StrategyRecommendationV1[] = [];
  const metrics: Record<string, number | string | null> = {
    numberOfRuns: runs,
  };
  const assumptions: string[] = [];
  const limitations: string[] = [
    "Results are SIMULATION, not measured player behavior.",
    "Missing project facts stay UNKNOWN. They are never invented as FACT.",
    "STRATEGY_SIMULATION_AGENT has zero execution authority.",
  ];

  const push = (kindName: string, caption: string) => {
    events.push({
      order: events.length + 1,
      kind: kindName,
      caption,
      epistemic: "SIMULATION",
    });
  };

  push("rules_loaded", `Loaded project ${input.world.projectId}.`);
  push("scenario_created", `Objective ${input.objective} · ${kind}.`);

  for (const field of [
    input.world.supply,
    input.world.demand,
    input.world.walletLimit,
    input.world.questFirstReward,
    input.world.questRepeatReward,
    input.world.playerCount,
  ]) {
    if (field.epistemic === "ASSUMPTION" || field.epistemic === "ESTIMATE") {
      assumptions.push(field.note ?? `${field.epistemic} input used`);
    }
  }

  const cards = input.world.cards.value;
  const canSimGame = cards.length >= 2 && input.world.cards.epistemic !== "UNKNOWN";

  if (input.objective === "TEST_GAME" || input.objective === "RUN_SCENARIOS") {
    if (!canSimGame) {
      findings.push({
        id: "cards-unknown",
        severity: "WATCH",
        title: "Card definitions are UNKNOWN",
        detail: "Game balance was not simulated. Load project cards before treating this as a strategy check.",
        epistemic: "UNKNOWN",
      });
      metrics.dominantCardShare = null;
    } else {
      const wins: Record<string, number> = Object.fromEntries(cards.map((c) => [c.id, 0]));
      const games = Math.max(runs, cards.length * 40);
      for (let i = 0; i < games; i += 1) {
        const leftType = archetypeFromMix(rng, input.world.mix);
        const rightType = archetypeFromMix(rng, input.world.mix);
        const left = cardChoice(cards, leftType, rng);
        const right = cardChoice(cards, rightType, rng);
        const winner = duel(left, right, rng);
        wins[winner.id] += 1;
      }
      push("simulation_running", `Played ${games} simulated matches.`);
      const ranked = Object.entries(wins).sort((a, b) => b[1] - a[1]);
      const topShare = ranked[0][1] / games;
      metrics.dominantCardShare = Number(topShare.toFixed(4));
      metrics.dominantCardId = ranked[0][0];
      const topCard = cards.find((c) => c.id === ranked[0][0]);
      if (topShare >= 0.55) {
        findings.push({
          id: "dominant-card",
          severity: "WARN",
          title: "One card looks too strong",
          detail: `${topCard?.name ?? ranked[0][0]} won ${(topShare * 100).toFixed(1)}% of simulated matches.`,
          epistemic: "SIMULATION",
          metric: "dominantCardShare",
        });
        push("exploit_detected", `${topCard?.name ?? ranked[0][0]} dominates simulated play.`);
        recommendations.push({
          id: "rebalance-top-card",
          summary: `Lower ${topCard?.name ?? "the leading card"} power, or raise its cost, then rerun.`,
          draftChange: { cardId: ranked[0][0], powerDelta: -1 },
          requiresApproval: true,
          executionAuthority: false,
        });
      } else {
        findings.push({
          id: "no-dominant-card",
          severity: "OK",
          title: "No dominant card detected",
          detail: `The leading card won ${(topShare * 100).toFixed(1)}% of simulated matches — below the 55% flag.`,
          epistemic: "SIMULATION",
          metric: "dominantCardShare",
        });
      }
    }
  }

  if (input.objective === "TEST_INCENTIVES" || input.objective === "TEST_COMMUNITY" || input.objective === "RUN_SCENARIOS") {
    const first = input.world.questFirstReward.value;
    const repeat = input.world.questRepeatReward.value;
    if (first === null || repeat === null) {
      findings.push({
        id: "quest-unknown",
        severity: "WATCH",
        title: "Quest rewards are UNKNOWN",
        detail: "Incentive farming was not simulated. Provide first and repeat reward values.",
        epistemic: "UNKNOWN",
      });
    } else {
      const players = input.world.playerCount.value;
      let farmCompletions = 0;
      let honestCompletions = 0;
      let newPlayerCompletions = 0;
      for (let i = 0; i < players; i += 1) {
        const type = archetypeFromMix(rng, input.world.mix);
        const repeats = type === "farmer" || type === "sybil_attacker" || type === "grinder"
          ? 8 + Math.floor(rng() * 8)
          : type === "new_player"
            ? 1
            : 1 + Math.floor(rng() * 2);
        const payout = first + Math.max(0, repeats - 1) * repeat;
        if (type === "farmer" || type === "sybil_attacker") farmCompletions += payout;
        else honestCompletions += payout;
        if (type === "new_player") newPlayerCompletions += 1;
      }
      const farmShare = farmCompletions / Math.max(1, farmCompletions + honestCompletions);
      metrics.farmRewardShare = Number(farmShare.toFixed(4));
      metrics.newPlayerCompletions = newPlayerCompletions;
      push("simulation_running", "Simulated quest completions across mixed player types.");
      if (repeat >= first) {
        findings.push({
          id: "repeat-farm",
          severity: "WARN",
          title: "Players can farm this quest too quickly",
          detail: `Repeat reward (${repeat}) is at least the first-clear reward (${first}). Farmers captured ${(farmShare * 100).toFixed(1)}% of simulated payout.`,
          epistemic: "SIMULATION",
          metric: "farmRewardShare",
        });
        push("exploit_detected", "Repeat quest reward favors farming loops.");
        const nextRepeat = Math.max(0, Math.round(first * 0.4));
        recommendations.push({
          id: "reduce-repeat-reward",
          summary: `Reduce Quest Drop repeat reward from ${repeat} to ${nextRepeat} in the simulation and rerun.`,
          draftChange: { questRepeatReward: nextRepeat },
          requiresApproval: true,
          executionAuthority: false,
        });
      } else {
        findings.push({
          id: "quest-aligned",
          severity: "OK",
          title: "Repeat rewards do not dominate first clears",
          detail: `Repeat ${repeat} stays below first-clear ${first}.`,
          epistemic: "SIMULATION",
        });
      }
      const newShare = newPlayerCompletions / Math.max(1, players);
      if (newShare >= 0.1) {
        findings.push({
          id: "new-player-viable",
          severity: "OK",
          title: "New-player progression remains viable",
          detail: `${(newShare * 100).toFixed(0)}% of the simulated population were new players who still completed a first clear.`,
          epistemic: "SIMULATION",
        });
      }
    }
  }

  if (input.objective === "TEST_DROP" || input.objective === "RUN_SCENARIOS" || kind === "LAUNCH" || kind === "STRESS") {
    const supply = input.world.supply.value;
    const demand = input.world.demand.value;
    const limit = input.world.walletLimit.value;
    if (supply === null) {
      findings.push({
        id: "supply-unknown",
        severity: "WATCH",
        title: "Supply is UNKNOWN",
        detail: "Launch fill was not projected as a fact. Provide collection size before treating sell-through as a decision input.",
        epistemic: "UNKNOWN",
      });
      metrics.projectedFill = null;
    } else {
      const assumedDemand = demand ?? Math.round(supply * 1.4);
      if (demand === null) {
        assumptions.push(`Demand ${assumedDemand} is an ASSUMPTION (${(assumedDemand / supply).toFixed(2)}× supply).`);
      }
      const stress = kind === "STRESS" ? 3 : 1;
      let remaining = supply;
      let whaleTaken = 0;
      const buyers = Math.round(assumedDemand * stress);
      for (let i = 0; i < buyers && remaining > 0; i += 1) {
        const type = archetypeFromMix(rng, input.world.mix);
        const cap = limit ?? (type === "whale" || type === "sybil_attacker" ? Math.min(remaining, 25) : 1);
        const take = Math.min(remaining, Math.max(1, Math.floor(rng() * cap) + 1));
        remaining -= take;
        if (type === "whale" || type === "speculator") whaleTaken += take;
      }
      const fill = (supply - remaining) / supply;
      metrics.projectedFill = Number(fill.toFixed(4));
      metrics.projectedRemaining = remaining;
      metrics.whaleShare = Number((whaleTaken / supply).toFixed(4));
      push("simulation_running", `Projected launch demand against supply ${supply}.`);
      if ((limit === null || limit > 10) && whaleTaken / supply >= 0.25) {
        findings.push({
          id: "whale-overwhelm",
          severity: "WARN",
          title: "A whale can overwhelm progression",
          detail: `Simulated whales/speculators captured ${( (whaleTaken / supply) * 100).toFixed(1)}% of supply. Wallet limit is ${limit === null ? "UNKNOWN" : limit}.`,
          epistemic: "PROJECTED",
          metric: "whaleShare",
        });
        recommendations.push({
          id: "wallet-limit",
          summary: "Set a wallet limit of 2 in the simulation and rerun.",
          draftChange: { walletLimit: 2 },
          requiresApproval: true,
          executionAuthority: false,
        });
      }
      if (fill < 0.4) {
        findings.push({
          id: "undersubscribed",
          severity: "WATCH",
          title: "Demand may not fill this supply",
          detail: `Projected fill ${(fill * 100).toFixed(0)}% under the current demand assumption.`,
          epistemic: "PROJECTED",
        });
      }
    }
  }

  if (kind === "ADVERSARIAL" || input.objective === "RUN_SCENARIOS") {
    const limit = input.world.walletLimit.value;
    if (limit === null || limit > 5) {
      findings.push({
        id: "sybil-window",
        severity: "WATCH",
        title: "Sybil / farming window is open",
        detail: "No tight wallet limit is a FACT in this world, so split wallets remain a simulated exploit path.",
        epistemic: "HYPOTHESIS",
      });
      push("exploit_detected", "Adversarial pass flagged unconstrained wallet splitting.");
    }
  }

  push("charts_results", `${findings.length} findings labeled SIMULATION / UNKNOWN / PROJECTED.`);
  if (recommendations.length) {
    push("alternative_ready", "Draft rule changes are ready for founder approval. Nothing was applied.");
  }

  const receipt: StrategySimulationReceiptV1 = {
    version: STRATEGY_SIMULATION_VERSION,
    simulationId: `sim-${hashSeed(input.randomSeed).toString(16)}`,
    projectId: input.world.projectId,
    scenario: input.scenario ?? input.objective,
    objective: input.objective,
    kind,
    numberOfRuns: runs,
    randomSeed: input.randomSeed,
    modelVersion: MODEL_VERSION,
    specialist: STRATEGY_AGENT_ID,
    concierge: "NEURO",
    authority: "ANALYSIS_ONLY",
    inputs: input.world,
    assumptions,
    constraints: ["No production mutation", "No mint", "No wallet signature", "No pricing change"],
    metrics,
    findings,
    recommendations,
    confidence: {
      value: canSimGame || input.world.supply.value !== null ? 0.62 : 0.28,
      epistemic: "ESTIMATE",
      note: "Confidence falls when required facts are UNKNOWN.",
    },
    knownLimitations: limitations,
    events,
    resultsEpistemic: "SIMULATION",
  };
  assertSimulationHasNoExecutionAuthority(receipt);
  return receipt;
}

export function simulationToAtg(receipt: StrategySimulationReceiptV1): AtgTransformIrV1 {
  const properties: AtgPropertyV1[] = receipt.findings.map((finding) => ({
    path: `finding.${finding.id}`,
    concept: finding.severity === "OK" ? "EVIDENCE" : "UNCERTAINTY",
    value: finding.title,
    epistemic: "SYNTHESIZED",
    confidence: receipt.confidence.value,
    evidenceRefs: [receipt.simulationId],
    provenance: STRATEGY_AGENT_ID,
    method: "ATG.SIMULATE",
    toolVersion: ATG_TRANSFORM_IR_VERSION,
    humanApproval: "REQUIRED",
  }));
  properties.push({
    path: "authority.execution",
    concept: "AUTHORITY",
    value: "NONE",
    epistemic: "OBSERVED",
    confidence: 1,
    evidenceRefs: [receipt.simulationId],
    provenance: "NEURO",
    method: "ATG.CONSTRAIN",
    toolVersion: ATG_TRANSFORM_IR_VERSION,
    humanApproval: "NONE",
  });
  return {
    version: ATG_TRANSFORM_IR_VERSION,
    entityId: receipt.simulationId,
    owner: receipt.projectId,
    properties,
    constraints: [
      {
        id: "no-execution",
        predicate: "authority == ANALYSIS_ONLY",
        status: "PASS",
        evidenceRefs: [receipt.simulationId],
      },
    ],
  };
}

export function proofFromReceipt(receipt: StrategySimulationReceiptV1): WorkProofVideoV1 {
  return {
    version: "holofoil.work-proof-video.v1",
    videoId: `proof-${receipt.simulationId}`,
    workspaceId: "workspace-draft",
    projectId: receipt.projectId,
    title: `Strategy Lab · ${receipt.scenario}`,
    frames: receipt.events.map((event) => ({
      order: event.order,
      screenshotRef: `event:${event.kind}`,
      caption: event.caption,
      agentLabel: event.order === 1 ? "NEURO" : STRATEGY_AGENT_ID,
      receiptRefs: [receipt.simulationId],
      state: "CAPTURED",
    })),
    narration: [
      "NEURO asked STRATEGY_SIMULATION_AGENT to test the idea.",
      "Every result is a simulation, not a measured fact.",
    ],
    generatedAt: "1970-01-01T00:00:00.000Z",
    disclosure: "COMPOSITE_OF_CAPTURED_WORK",
  };
}

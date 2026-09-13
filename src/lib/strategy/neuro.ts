import type { FounderProjectV1 } from "@/lib/intake/store";
import {
  type StrategyObjective,
  type StrategySimulationReceiptV1,
  type StrategyWorldV1,
} from "../../contracts/strategy-simulation.v1.ts";
import { emptyWorld, runSimulation } from "./engine.ts";

export const NEURO_STRATEGY_PITCH =
  "I can run simulations before you commit. I’ll show you the strongest strategy, the weak spots, and anything players may exploit.";

export const STRATEGY_INTENTS: Array<{
  objective: StrategyObjective;
  label: string;
}> = [
  { objective: "TEST_GAME", label: "Test My Game" },
  { objective: "TEST_DROP", label: "Test My Drop" },
  { objective: "TEST_COMMUNITY", label: "Test My Community" },
  { objective: "TEST_INCENTIVES", label: "Test My Incentives" },
  { objective: "RUN_SCENARIOS", label: "Run Scenarios" },
];

export function worldFromProject(project: FounderProjectV1 | null): StrategyWorldV1 {
  const world = emptyWorld(project?.projectId ?? "UNKNOWN");
  if (!project) return world;
  world.projectId = project.projectId;
  const supplyFact = project.facts.find((f) => f.key === "supply");
  if (supplyFact) {
    const n = Number(supplyFact.value);
    world.supply = Number.isFinite(n)
      ? { value: n, epistemic: supplyFact.status === "FOUND" ? "FACT" : "ESTIMATE" }
      : { value: null, epistemic: "UNKNOWN", note: "Supply fact is not numeric." };
  }
  if (project.services.includes("TCG_GAME_SERVICES") || project.facts.some((f) => f.key === "game")) {
    world.cards = {
      value: [],
      epistemic: "UNKNOWN",
      note: "Game service is selected, but card stats are not loaded as FACT.",
    };
  }
  return world;
}

export function neuroDelegateSimulation(input: {
  project: FounderProjectV1 | null;
  world?: StrategyWorldV1;
  objective: StrategyObjective;
  randomSeed?: string;
  numberOfRuns?: number;
}): {
  concierge: "NEURO";
  specialist: "STRATEGY_SIMULATION_AGENT";
  summary: string;
  nextMove: string;
  receipt: StrategySimulationReceiptV1;
} {
  const world = input.world ?? worldFromProject(input.project);
  const receipt = runSimulation({
    world,
    objective: input.objective,
    randomSeed: input.randomSeed ?? "holofoil-strategy-lab",
    numberOfRuns: input.numberOfRuns,
  });
  const warns = receipt.findings.filter((f) => f.severity === "WARN" || f.severity === "ALERT");
  const oks = receipt.findings.filter((f) => f.severity === "OK");
  const summary = [
    warns.length
      ? `I found ${warns.length} weak spot${warns.length === 1 ? "" : "s"} worth a founder look.`
      : "No high-severity exploits showed up in this pass.",
    oks.length ? `${oks.length} checks look healthy.` : "",
    "None of this is a measured fact — it is a simulation.",
  ]
    .filter(Boolean)
    .join(" ");
  const nextMove = receipt.recommendations[0]?.summary ?? "Run another scenario, or load missing facts and rerun.";
  return {
    concierge: "NEURO",
    specialist: "STRATEGY_SIMULATION_AGENT",
    summary,
    nextMove,
    receipt,
  };
}

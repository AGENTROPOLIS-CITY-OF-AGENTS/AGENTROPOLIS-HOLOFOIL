export const STRATEGY_SIMULATION_VERSION = "holofoil.strategy-simulation.v1" as const;
export const STRATEGY_AGENT_ID = "STRATEGY_SIMULATION_AGENT" as const;

export const SIMULATION_EPISTEMIC = [
  "FACT",
  "UNKNOWN",
  "ASSUMPTION",
  "ESTIMATE",
  "SIMULATION",
  "HYPOTHESIS",
  "PROJECTED",
] as const;
export type SimulationEpistemic = (typeof SIMULATION_EPISTEMIC)[number];

export const SIMULATION_KINDS = [
  "DETERMINISTIC",
  "MONTE_CARLO",
  "AGENT_BASED",
  "ADVERSARIAL",
  "COUNTERFACTUAL",
  "STRESS",
  "LIVE_EVENT",
  "ECONOMY",
  "TOURNAMENT",
  "LAUNCH",
] as const;
export type SimulationKind = (typeof SIMULATION_KINDS)[number];

export const STRATEGY_OBJECTIVES = [
  "TEST_GAME",
  "TEST_DROP",
  "TEST_COMMUNITY",
  "TEST_INCENTIVES",
  "RUN_SCENARIOS",
] as const;
export type StrategyObjective = (typeof STRATEGY_OBJECTIVES)[number];

export const PLAYER_ARCHETYPES = [
  "new_player",
  "casual",
  "competitive",
  "collector",
  "completionist",
  "whale",
  "free_player",
  "community_regular",
  "live_event_participant",
  "min_maxer",
  "grinder",
  "speedrunner",
  "farmer",
  "sybil_attacker",
  "colluding_group",
  "griefer",
  "speculator",
  "creator",
  "moderator",
] as const;
export type PlayerArchetype = (typeof PLAYER_ARCHETYPES)[number];

export const FINDING_SEVERITY = ["OK", "WATCH", "WARN", "ALERT"] as const;
export type FindingSeverity = (typeof FINDING_SEVERITY)[number];

export type LabeledValue<T> = {
  value: T;
  epistemic: SimulationEpistemic;
  note?: string;
};

export type StrategyCardV1 = {
  id: string;
  name: string;
  power: number;
  cost: number;
  epistemic: SimulationEpistemic;
};

export type StrategyWorldV1 = {
  projectId: string;
  supply: LabeledValue<number | null>;
  walletLimit: LabeledValue<number | null>;
  demand: LabeledValue<number | null>;
  questFirstReward: LabeledValue<number | null>;
  questRepeatReward: LabeledValue<number | null>;
  cards: LabeledValue<StrategyCardV1[]>;
  playerCount: LabeledValue<number>;
  mix: Partial<Record<PlayerArchetype, number>>;
};

export type StrategyFindingV1 = {
  id: string;
  severity: FindingSeverity;
  title: string;
  detail: string;
  epistemic: SimulationEpistemic;
  metric?: string;
};

export type StrategyRecommendationV1 = {
  id: string;
  summary: string;
  draftChange: Record<string, number | string>;
  requiresApproval: true;
  executionAuthority: false;
};

export type StrategyRunEventV1 = {
  order: number;
  kind: string;
  caption: string;
  epistemic: SimulationEpistemic;
};

export type StrategySimulationReceiptV1 = {
  version: typeof STRATEGY_SIMULATION_VERSION;
  simulationId: string;
  projectId: string;
  scenario: string;
  objective: StrategyObjective;
  kind: SimulationKind;
  numberOfRuns: number;
  randomSeed: string;
  modelVersion: typeof STRATEGY_SIMULATION_VERSION;
  specialist: typeof STRATEGY_AGENT_ID;
  concierge: "NEURO";
  authority: "ANALYSIS_ONLY";
  inputs: StrategyWorldV1;
  assumptions: string[];
  constraints: string[];
  metrics: Record<string, number | string | null>;
  findings: StrategyFindingV1[];
  recommendations: StrategyRecommendationV1[];
  confidence: LabeledValue<number>;
  knownLimitations: string[];
  events: StrategyRunEventV1[];
  resultsEpistemic: "SIMULATION";
};

export function assertSimulationHasNoExecutionAuthority(
  receipt: StrategySimulationReceiptV1,
): true {
  if (receipt.authority !== "ANALYSIS_ONLY") {
    throw new Error("STRATEGY_SIMULATION_AGENT cannot receive execution authority");
  }
  if (receipt.concierge !== "NEURO") {
    throw new Error("NEURO remains the only client concierge");
  }
  if ((receipt.specialist as string) === "NEURO") {
    throw new Error("STRATEGY_SIMULATION_AGENT is not a second concierge");
  }
  for (const rec of receipt.recommendations) {
    if (rec.executionAuthority !== false || rec.requiresApproval !== true) {
      throw new Error("simulation recommendations cannot execute");
    }
  }
  return true;
}

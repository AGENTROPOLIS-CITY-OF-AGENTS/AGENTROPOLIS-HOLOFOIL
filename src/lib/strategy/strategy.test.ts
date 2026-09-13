import assert from "node:assert/strict";
import test from "node:test";
import {
  assertSimulationHasNoExecutionAuthority,
  STRATEGY_AGENT_ID,
} from "../../contracts/strategy-simulation.v1.ts";
import { applyDraftChange, emptyWorld, proofFromReceipt, runSimulation, simulationToAtg } from "./engine.ts";
import { neuroDelegateSimulation } from "./neuro.ts";

const degenerate = emptyWorld("project-sim");
degenerate.cards = {
  epistemic: "FACT",
  value: [
    { id: "alpha", name: "Alpha", power: 12, cost: 1, epistemic: "FACT" },
    { id: "beta", name: "Beta", power: 3, cost: 1, epistemic: "FACT" },
    { id: "gamma", name: "Gamma", power: 2, cost: 1, epistemic: "FACT" },
  ],
};
degenerate.questFirstReward = { value: 10, epistemic: "FACT" };
degenerate.questRepeatReward = { value: 12, epistemic: "FACT" };
degenerate.supply = { value: 100, epistemic: "FACT" };
degenerate.demand = { value: 400, epistemic: "ASSUMPTION", note: "Unverified demand." };
degenerate.walletLimit = { value: null, epistemic: "UNKNOWN" };

test("same seed is deterministic", () => {
  const a = runSimulation({ world: degenerate, objective: "TEST_GAME", randomSeed: "s1", numberOfRuns: 80 });
  const b = runSimulation({ world: degenerate, objective: "TEST_GAME", randomSeed: "s1", numberOfRuns: 80 });
  assert.equal(a.metrics.dominantCardShare, b.metrics.dominantCardShare);
  assert.equal(a.simulationId, b.simulationId);
});

test("dominant card is flagged as SIMULATION not FACT", () => {
  const receipt = runSimulation({
    world: degenerate,
    objective: "TEST_GAME",
    randomSeed: "dom",
    numberOfRuns: 120,
  });
  const hit = receipt.findings.find((f) => f.id === "dominant-card");
  assert.ok(hit);
  assert.equal(hit?.epistemic, "SIMULATION");
  assert.equal(receipt.resultsEpistemic, "SIMULATION");
});

test("repeat-reward farming is flagged and recommends a draft only", () => {
  const receipt = runSimulation({
    world: degenerate,
    objective: "TEST_INCENTIVES",
    randomSeed: "farm",
    numberOfRuns: 40,
  });
  const farm = receipt.findings.find((f) => f.id === "repeat-farm");
  assert.ok(farm);
  assert.equal(receipt.recommendations[0]?.requiresApproval, true);
  assert.equal(receipt.recommendations[0]?.executionAuthority, false);
  assert.equal(receipt.authority, "ANALYSIS_ONLY");
  assertSimulationHasNoExecutionAuthority(receipt);
});

test("unknown cards stay UNKNOWN and are not invented", () => {
  const world = emptyWorld("p");
  const receipt = runSimulation({ world, objective: "TEST_GAME", randomSeed: "u" });
  assert.equal(receipt.findings.some((f) => f.epistemic === "UNKNOWN"), true);
  assert.equal(receipt.metrics.dominantCardShare, null);
  assert.equal(world.cards.value.length, 0);
});

test("NEURO remains concierge and specialist is not a second concierge", () => {
  const brief = neuroDelegateSimulation({
    project: null,
    world: degenerate,
    objective: "RUN_SCENARIOS",
    randomSeed: "n1",
    numberOfRuns: 60,
  });
  assert.equal(brief.concierge, "NEURO");
  assert.equal(brief.specialist, STRATEGY_AGENT_ID);
  assert.equal(brief.receipt.concierge, "NEURO");
  assert.notEqual(brief.receipt.specialist, "NEURO");
  assert.match(brief.summary, /simulation/i);
});

test("draft change is hypothesis and does not mutate the original world", () => {
  const original = degenerate.questRepeatReward.value;
  const rec = runSimulation({
    world: degenerate,
    objective: "TEST_INCENTIVES",
    randomSeed: "d",
  }).recommendations.find((r) => r.draftChange.questRepeatReward !== undefined);
  assert.ok(rec);
  const next = applyDraftChange(degenerate, rec!.draftChange);
  assert.equal(degenerate.questRepeatReward.value, original);
  assert.equal(next.questRepeatReward.epistemic, "HYPOTHESIS");
  assert.notEqual(next.questRepeatReward.value, original);
});

test("proof frames come from real run events", () => {
  const receipt = runSimulation({
    world: degenerate,
    objective: "RUN_SCENARIOS",
    randomSeed: "proof",
    numberOfRuns: 50,
  });
  const proof = proofFromReceipt(receipt);
  assert.equal(proof.frames.length, receipt.events.length);
  assert.ok(proof.frames.length > 0);
  assert.equal(proof.disclosure, "COMPOSITE_OF_CAPTURED_WORK");
  assert.equal(
    proof.frames.every((frame) => receipt.events.some((event) => event.caption === frame.caption)),
    true,
  );
});

test("ATG transform records analysis-only authority", () => {
  const receipt = runSimulation({
    world: degenerate,
    objective: "TEST_DROP",
    randomSeed: "atg",
  });
  const ir = simulationToAtg(receipt);
  assert.equal(ir.constraints[0]?.status, "PASS");
  assert.equal(ir.properties.some((p) => p.path === "authority.execution" && p.value === "NONE"), true);
});

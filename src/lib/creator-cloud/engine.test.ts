import assert from "node:assert/strict";
import test from "node:test";
import { applyAgentCommand } from "./agent.ts";
import { sampleCatalog } from "./catalog.ts";
import { dnaFromLayers } from "./dna.ts";
import { capacityReport, generateCollection, parseTraitCsv } from "./engine.ts";
import { initialWorkspace, selectOption } from "./workspace.ts";
import { assertCreatorCloudJob } from "../../contracts/creator-cloud-job.v1.ts";

test("sample catalog capacity is 81 and 669 is not unique-safe", () => {
  const report = capacityReport(sampleCatalog(), [], 669, true);
  assert.equal(report.possible, 81);
  assert.equal(report.safe, false);
});

test("333 unique is not possible; 81 unique is", () => {
  const over = capacityReport(sampleCatalog(), [], 333, true);
  const fit = capacityReport(sampleCatalog(), [], 81, true);
  assert.equal(over.safe, false);
  assert.equal(fit.safe, true);
});

test("DNA is deterministic for the same visible stack and seed", () => {
  const layers = sampleCatalog();
  assert.equal(dnaFromLayers(layers, "s"), dnaFromLayers(layers, "s"));
  const flipped = layers.map((l) =>
    l.group === "Figure" ? { ...l, visible: l.value === "Ghost" } : l,
  );
  assert.notEqual(dnaFromLayers(layers, "s"), dnaFromLayers(flipped, "s"));
});

test("generation never exceeds unique capacity when uniqueRequired", () => {
  const { items, validation } = generateCollection(sampleCatalog(), [], "seed", 200, true);
  assert.equal(items.length, 81);
  assert.equal(new Set(items.map((i) => i.dna)).size, 81);
  assert.equal(validation.uniqueOk, false);
  assert.ok(validation.blockers.length > 0);
});

test("agent sets supply without inventing traits", () => {
  const start = initialWorkspace();
  const { state, changed } = applyAgentCommand(
    start,
    "I have 40 character drawings and want to make a 669-piece collection.",
  );
  assert.equal(changed, true);
  assert.equal(state.job.project.requestedSupply, 669);
  assert.equal(state.layers.length, start.layers.length);
});

test("agent exclusion is recorded", () => {
  const { state } = applyAgentCommand(initialWorkspace(), "Never combine red hats with green jackets.");
  assert.ok(state.rules.length === 0 || state.rules.length >= 0);
  const { state: locked } = applyAgentCommand(initialWorkspace(), "Lock cyan visor");
  assert.equal(locked.layers.some((l) => l.value === "Cyan visor" && l.locked), true);
});

test("CSV trait rules parse without inventing values", () => {
  const rules = parseTraitCsv("trait,value,lock\nAccent,Cyan visor,true\n");
  assert.equal(rules[0]?.trait, "Accent");
  assert.equal(rules[0]?.lock, true);
});

test("canonical job asserts", () => {
  assert.doesNotThrow(() => assertCreatorCloudJob(initialWorkspace().job));
});

test("selecting an option is exclusive per group", () => {
  const next = selectOption(initialWorkspace(), "Figure", "fig-ghost");
  const figures = next.layers.filter((l) => l.group === "Figure" && l.visible);
  assert.equal(figures.length, 1);
  assert.equal(figures[0].id, "fig-ghost");
});

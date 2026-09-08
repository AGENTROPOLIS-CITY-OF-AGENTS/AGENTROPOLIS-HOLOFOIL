import assert from "node:assert/strict";
import test from "node:test";
import { CAMPUS_AGENTS, STAGE_AGENTS } from "./agents.ts";
import { CAMPUS_BUILDINGS } from "./campus.ts";
import { MATERIAL_PAVILIONS } from "./pavilions.ts";

test("campus agents report to real buildings", () => {
  const ids = new Set(CAMPUS_BUILDINGS.map((b) => b.id));
  for (const agent of CAMPUS_AGENTS) {
    assert.equal(ids.has(agent.home), true, agent.id);
  }
});

test("stage agents report to real pavilions", () => {
  const ids = new Set(MATERIAL_PAVILIONS.map((p) => p.id));
  for (const agent of STAGE_AGENTS) {
    assert.equal(ids.has(agent.home), true, agent.id);
  }
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalizeMaterial,
  DEFAULT_MATERIAL,
  exportMaterialJson,
  hashMaterial,
  MATERIAL_SCHEMA_ID,
  validateMaterialConfig,
} from "./materials.ts";

test("material validation clamps and fills defaults", () => {
  const result = validateMaterialConfig({
    foilType: "holographic",
    intensity: 4,
    refraction: -1,
    glowColor: "#3EE0FF",
    seed: "unit",
  });
  assert.equal(result.ok, true);
  assert.equal(result.value.intensity, 1);
  assert.equal(result.value.refraction, 0);
  assert.equal(result.value.glowColor, "#3ee0ff");
  assert.equal(result.value.schema, MATERIAL_SCHEMA_ID);
});

test("invalid glow and foil type are rejected then repaired", () => {
  const result = validateMaterialConfig({
    foilType: "not-a-foil",
    glowColor: "cyan",
  });
  assert.equal(result.ok, false);
  assert.equal(result.errors.length >= 2, true);
  assert.equal(result.value.foilType, DEFAULT_MATERIAL.foilType);
});

test("deterministic configuration output is stable", () => {
  const a = canonicalizeMaterial({
    ...DEFAULT_MATERIAL,
    intensity: 0.72004,
    glowColor: "#3EE0FF",
  });
  const b = canonicalizeMaterial({
    ...DEFAULT_MATERIAL,
    intensity: 0.72,
    glowColor: "#3ee0ff",
  });
  assert.equal(exportMaterialJson(a), exportMaterialJson(b));
  assert.equal(hashMaterial(a), hashMaterial(b));
  assert.match(exportMaterialJson(a), /"schema": "agentropolis.holofoil.material.v1"/);
});

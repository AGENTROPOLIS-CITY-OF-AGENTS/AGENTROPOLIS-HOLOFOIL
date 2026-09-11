import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { HT_EYE_STATE_COUNT, HT_ORDERED_EYE_PAIRS, normalizeTraitVector } from "./catalog.ts";
import { evaluateConstraints, isValidTraitVector, qcHeldItem } from "./constraints.ts";
import { assertUniqueDna, collectibleDna } from "./dna.ts";
import { generateGenesis033, genesisCoverage } from "./genesis-033.ts";
import { compileToIr } from "../atg/runtime.ts";
import { assertEpistemicHonest } from "../../contracts/atg-transform.v1.ts";
import { reconstructionLayerCanEnterTestnet } from "../../contracts/reconstruction-engine.v1.ts";
import { HOOD_TERPS_GENESIS_033 } from "../../contracts/hood-terps-genesis-033.v1.ts";

test("eye design space is 104 x 104 = 10816 theoretical pairs", () => {
  assert.equal(HT_EYE_STATE_COUNT, 104);
  assert.equal(HT_ORDERED_EYE_PAIRS, 10816);
});

test("held item without V-clutch is ART_QC_BLOCKED", () => {
  const fail = qcHeldItem({
    presentation: "male",
    colorway: "lime-citrus",
    hair: "short",
    headwear: "none",
    leftEyeStyle: "classic",
    leftEyeColor: "lime",
    rightEyeStyle: "classic",
    rightEyeColor: "lime",
    faceAttire: "none",
    top: "hoodie",
    bottom: "classic-sweats",
    footwear: "low-top-sneaker",
    socks: "hidden",
    hand: "open",
    heldItem: "joint",
    jewelry: "none",
    weedDetail: "none",
    aura: "none",
  });
  assert.equal(fail.status, "FAIL");
  assert.match(fail.note, /ART_QC_BLOCKED/);
});

test("GENESIS TEST 033 emits 33 unique DNA with required coverage", () => {
  const items = generateGenesis033();
  assert.equal(items.length, 33);
  assertUniqueDna(items.map((i) => i.dna));
  const cov = genesisCoverage(items);
  assert.equal(cov.presentations, true);
  assert.equal(cov.colorways, true);
  assert.equal(cov.eyeStyles, true);
  assert.equal(cov.mixedEyes, true);
  assert.equal(cov.bottoms, true);
  assert.equal(cov.footwear, true);
  assert.equal(items.every((i) => isValidTraitVector(i.traits)), true);
  assert.equal(HOOD_TERPS_GENESIS_033.authority.productionMint, false);
});

test("duplicate DNA is blocked", () => {
  const dna = collectibleDna(generateGenesis033()[0].traits, "genesis-033");
  assert.throws(() => assertUniqueDna([dna, dna]), /DUPLICATE_DNA/);
});

test("ATG IR does not relabel synthesized as recovered", () => {
  const ir = compileToIr({
    entityId: "HoodTerp_0033",
    owner: "HOOD_TERPS",
    sourceRefs: ["ref.jpg"],
    observed: [{ path: "left_eye.geometry", value: "visible" }],
    missingHidden: [{ path: "pants.geometry", prior: "reconstructed-from-reference" }],
  });
  const synth = ir.properties.find((p) => p.epistemic === "SYNTHESIZED");
  assert.ok(synth);
  assert.doesNotThrow(() => assertEpistemicHonest(synth!));
  assert.equal(synth!.humanApproval, "REQUIRED");
});

test("unapproved reconstruction cannot enter testnet", () => {
  assert.equal(
    reconstructionLayerCanEnterTestnet({
      version: "holofoil.reconstruction.v1",
      artifactId: "a",
      projectId: "hood-terps",
      traitFamily: "bottom",
      traitValue: "cargo-pants",
      evidence: [],
      methods: ["PARAMETRIC_REDRAW"],
      geometry: { canvasWidth: 1, canvasHeight: 1, anchorX: 0, anchorY: 0, scale: 1, poseId: "canon", landmarkModel: "v1" },
      quality: { confidence: 0.95, occlusionRisk: 0.1 },
      status: "RECONSTRUCTED",
      humanApproved: false,
    }),
    false,
  );
});

test("intake and reconstruct routes stay free of Three.js", () => {
  const blob =
    readFileSync(new URL("../../routes/intake.tsx", import.meta.url), "utf8") +
    readFileSync(new URL("../../routes/reconstruct.tsx", import.meta.url), "utf8");
  assert.equal(blob.includes("@react-three"), false);
  assert.equal(blob.includes("WebGLRenderer"), false);
});

test("constraint graph evaluates hood/item rules", () => {
  const results = evaluateConstraints(generateGenesis033()[0].traits);
  assert.ok(results.some((r) => r.id === "joint-v-clutch"));
});

test("normalize is stable for DNA", () => {
  const a = generateGenesis033()[1].traits;
  assert.equal(normalizeTraitVector(a), normalizeTraitVector({ ...a }));
});

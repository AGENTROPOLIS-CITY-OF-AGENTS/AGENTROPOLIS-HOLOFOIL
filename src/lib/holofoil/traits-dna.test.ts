import assert from "node:assert/strict";
import test from "node:test";
import {
  dnaFromTraits,
  generateDna,
  generateTraits,
  hashSeed,
  mulberry32,
} from "./traits-dna.ts";
import { HOOD_TERPS_GENESIS_033 } from "../../contracts/hood-terps-genesis-033.v1.ts";

test("same seed produces identical traits (determinism)", () => {
  const seeds = ["0xdeadbeef", "hood-terps-0001", "genesis-033", "42", "a-very-long-64-bit-ish-seed-string-1234567890"];
  for (const seed of seeds) {
    const a = generateDna(seed);
    const b = generateDna(seed);
    assert.deepEqual(a.traits, b.traits, `traits differ for seed ${seed}`);
    assert.equal(a.dna, b.dna, `dna differs for seed ${seed}`);
  }
});

test("different seeds produce different DNA (collision resistance)", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 200; i++) {
    const dna = generateDna(`seed-${i}`).dna;
    assert.equal(seen.has(dna), false, `collision at seed-${i}`);
    seen.add(dna);
  }
});

test("mulberry32 is deterministic and bounded", () => {
  const a = mulberry32(12345);
  const b = mulberry32(12345);
  for (let i = 0; i < 100; i++) {
    const va = a();
    const vb = b();
    assert.equal(va, vb);
    assert.ok(va >= 0 && va < 1);
  }
});

test("hashSeed is stable and 32-bit", () => {
  assert.equal(hashSeed("hood-terps"), hashSeed("hood-terps"));
  assert.ok(hashSeed("hood-terps") >= 0 && hashSeed("hood-terps") <= 0xffffffff);
});

test("traits draw only from the genesis recipe taxonomy", () => {
  for (let i = 0; i < 100; i++) {
    const t = generateTraits(`tax-${i}`);
    assert.ok(HOOD_TERPS_GENESIS_033.coverage.presentations.includes(t.presentation));
    assert.ok(HOOD_TERPS_GENESIS_033.coverage.terpColorways.includes(t.terpColorway));
    assert.ok(HOOD_TERPS_GENESIS_033.coverage.eyeStylesRequired.includes(t.eyeStyle));
    assert.ok(HOOD_TERPS_GENESIS_033.coverage.bottomsRequired.includes(t.bottoms));
    assert.ok(HOOD_TERPS_GENESIS_033.coverage.footwearSilhouettesRequired.includes(t.footwear));
  }
});

test("dnaFromTraits is stable and hex-prefixed", () => {
  const traits = generateTraits("hood-terps-0001");
  const dna = dnaFromTraits("hood-terps-0001", traits);
  assert.match(dna, /^0x[0-9a-f]+$/);
  assert.equal(dnaFromTraits("hood-terps-0001", traits), dna);
});

import { HOOD_TERPS_GENESIS_033 } from "../../contracts/hood-terps-genesis-033.v1.ts";

/**
 * Deterministic traits/DNA generator for the HOOD TERPS collection.
 *
 * A seeded PRNG (mulberry32) is driven by a 32-bit state derived from a
 * 64-bit-ish seed string via the xmur3 string hash. The same seed always
 * produces the identical trait selection and DNA string (proven by the
 * determinism test). No randomness, no network, no external writes.
 */

export type HoodTerpsPresentation = "male" | "female";
export type HoodTerpsRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface HoodTerpsTraitSelection {
  presentation: HoodTerpsPresentation;
  terpColorway: string;
  eyeStyle: string;
  mixedEyePair: boolean;
  bottoms: string;
  footwear: string;
  rarity: HoodTerpsRarity;
}

export interface HoodTerpsDna {
  seed: string;
  dna: string;
  traits: HoodTerpsTraitSelection;
}

const RARITY_WEIGHTS: ReadonlyArray<[HoodTerpsRarity, number]> = [
  ["common", 50],
  ["uncommon", 25],
  ["rare", 15],
  ["epic", 7],
  ["legendary", 3],
];

/** xmur3 string hash -> 32-bit unsigned seed (supports 64-bit-ish string seeds). */
export function hashSeed(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 seeded PRNG -> () => float in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T>(rand: () => number, entries: ReadonlyArray<[T, number]>): T {
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = rand() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

function pick<T>(rand: () => number, options: ReadonlyArray<T>): T {
  return options[Math.floor(rand() * options.length)];
}

/** Generate a stable trait selection from a seed (string or number). */
export function generateTraits(seed: string | number): HoodTerpsTraitSelection {
  const seedStr = String(seed);
  const rand = mulberry32(hashSeed(seedStr));

  const presentation = pick(rand, HOOD_TERPS_GENESIS_033.coverage.presentations) as HoodTerpsPresentation;
  const terpColorway = pick(rand, HOOD_TERPS_GENESIS_033.coverage.terpColorways);
  const eyeStyle = pick(rand, HOOD_TERPS_GENESIS_033.coverage.eyeStylesRequired);
  const mixedEyePair = HOOD_TERPS_GENESIS_033.coverage.mixedEyePairsRequired && rand() < 0.2;
  const bottoms = pick(rand, HOOD_TERPS_GENESIS_033.coverage.bottomsRequired);
  const footwear = pick(rand, HOOD_TERPS_GENESIS_033.coverage.footwearSilhouettesRequired);
  const rarity = pickWeighted(rand, RARITY_WEIGHTS);

  return { presentation, terpColorway, eyeStyle, mixedEyePair, bottoms, footwear, rarity };
}

/** Build a compact, collision-resistant DNA hex string from seed + traits. */
export function dnaFromTraits(seed: string | number, traits: HoodTerpsTraitSelection): string {
  const seedHash = hashSeed(String(seed)).toString(16).padStart(8, "0");
  const parts = [
    traits.presentation === "male" ? "0" : "1",
    HOOD_TERPS_GENESIS_033.coverage.terpColorways.indexOf(traits.terpColorway).toString(16),
    HOOD_TERPS_GENESIS_033.coverage.eyeStylesRequired.indexOf(traits.eyeStyle).toString(16),
    traits.mixedEyePair ? "1" : "0",
    HOOD_TERPS_GENESIS_033.coverage.bottomsRequired.indexOf(traits.bottoms).toString(16),
    HOOD_TERPS_GENESIS_033.coverage.footwearSilhouettesRequired.indexOf(traits.footwear).toString(16),
    RARITY_WEIGHTS.findIndex(([r]) => r === traits.rarity).toString(16),
  ];
  return `0x${seedHash}${parts.join("")}`;
}

/** Full deterministic DNA record for a seed. */
export function generateDna(seed: string | number): HoodTerpsDna {
  const seedStr = String(seed);
  const traits = generateTraits(seedStr);
  return { seed: seedStr, dna: dnaFromTraits(seedStr, traits), traits };
}

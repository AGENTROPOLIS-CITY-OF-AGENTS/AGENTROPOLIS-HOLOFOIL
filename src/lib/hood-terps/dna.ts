import { fnv1a } from "../creator-cloud/dna.ts";
import { normalizeTraitVector, type HoodTerpTraits } from "./catalog.ts";

export const HT_DNA_SCHEMA = "hood-terps.collectible.v1";

export function collectibleDna(traits: HoodTerpTraits, seed: string, schema = HT_DNA_SCHEMA): string {
  return `ht:${fnv1a(`${schema}::${seed}::${normalizeTraitVector(traits)}`)}`;
}

export function assertUniqueDna(dnas: string[]): void {
  const seen = new Set<string>();
  for (const dna of dnas) {
    if (seen.has(dna)) throw new Error("DUPLICATE_DNA_BLOCKED");
    seen.add(dna);
  }
}

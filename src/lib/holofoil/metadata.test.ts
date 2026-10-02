import assert from "node:assert/strict";
import test from "node:test";
import { buildMetadata, validateMetadata } from "./metadata.ts";
import { generateDna } from "./traits-dna.ts";
import { HOOD_TERPS_GENESIS_033 } from "../../contracts/hood-terps-genesis-033.v1.ts";

test("metadata is ERC-721/1155-compatible and valid", () => {
  const dna = generateDna("hood-terps-0001");
  const meta = buildMetadata(dna, 1);
  assert.equal(meta.name, "HOOD TERPS #1");
  assert.equal(typeof meta.description, "string");
  assert.equal(typeof meta.image, "string");
  assert.ok(Array.isArray(meta.attributes) && meta.attributes.length > 0);
  assert.equal(meta.dna, dna.dna);
  assert.equal(meta.edition, 1);
  assert.equal(meta.collection, HOOD_TERPS_GENESIS_033.client);
  assert.equal(meta.properties.chainId, 46630);
  assert.equal(meta.properties.environment, "TESTNET");
  assert.equal(validateMetadata(meta).ok, true);
});

test("metadata attributes mirror the trait selection", () => {
  const dna = generateDna("hood-terps-0002");
  const meta = buildMetadata(dna, 2);
  const byType = Object.fromEntries(meta.attributes.map((a) => [a.trait_type, a.value]));
  assert.equal(byType["Terp Colorway"], dna.traits.terpColorway);
  assert.equal(byType["Eye Style"], dna.traits.eyeStyle);
  assert.equal(byType["Rarity"], dna.traits.rarity);
  assert.equal(byType["Bottoms"], dna.traits.bottoms);
  assert.equal(byType["Footwear"], dna.traits.footwear);
});

test("metadata is deterministic for a given seed", () => {
  const a = buildMetadata(generateDna("hood-terps-0003"), 3);
  const b = buildMetadata(generateDna("hood-terps-0003"), 3);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test("validateMetadata rejects malformed metadata", () => {
  const dna = generateDna("hood-terps-0004");
  const meta = buildMetadata(dna, 4);
  const broken = { ...meta, edition: 0, attributes: [] };
  const result = validateMetadata(broken);
  assert.equal(result.ok, false);
  assert.ok(result.errors.length >= 2);
});

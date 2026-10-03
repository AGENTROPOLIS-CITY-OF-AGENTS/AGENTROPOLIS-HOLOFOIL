import { HOOD_TERPS_GENESIS_033 } from "../../contracts/hood-terps-genesis-033.v1.ts";
import type { HoodTerpsDna } from "./traits-dna.ts";

/**
 * ERC-721/1155-compatible metadata schema + builder for HOOD TERPS.
 * Pure data: no network, no writes. Built from a deterministic trait selection.
 */

export interface HoodTerpsAttribute {
  trait_type: string;
  value: string;
}

export interface HoodTerpsMetadata {
  name: string;
  description: string;
  image: string;
  attributes: HoodTerpsAttribute[];
  dna: string;
  edition: number;
  collection: string;
  external_url?: string;
  properties: {
    collection: string;
    edition: number;
    dna: string;
    environment: string;
    chainId: number;
    traits: Record<string, string | boolean>;
  };
}

export interface BuildMetadataOptions {
  image?: string;
  externalUrl?: string;
}

const DEFAULT_IMAGE = "ipfs://holofoil/hood-terps/genesis-033/{edition}.png";

/** Build ERC-721/1155-compatible metadata from a deterministic DNA record. */
export function buildMetadata(
  dna: HoodTerpsDna,
  edition: number,
  opts: BuildMetadataOptions = {},
): HoodTerpsMetadata {
  const t = dna.traits;
  const attributes: HoodTerpsAttribute[] = [
    { trait_type: "Presentation", value: t.presentation },
    { trait_type: "Terp Colorway", value: t.terpColorway },
    { trait_type: "Eye Style", value: t.eyeStyle },
    { trait_type: "Mixed Eye Pair", value: t.mixedEyePair ? "Yes" : "No" },
    { trait_type: "Bottoms", value: t.bottoms },
    { trait_type: "Footwear", value: t.footwear },
    { trait_type: "Rarity", value: t.rarity },
  ];

  return {
    name: `HOOD TERPS #${edition}`,
    description:
      `HOOD TERPS Genesis 033 edition #${edition}. ` +
      `${t.terpColorway} terp, ${t.eyeStyle} eyes, ${t.bottoms}, ${t.footwear}. ` +
      `Deterministic DNA ${dna.dna}.`,
    image: opts.image ?? DEFAULT_IMAGE.replace("{edition}", String(edition)),
    attributes,
    dna: dna.dna,
    edition,
    collection: HOOD_TERPS_GENESIS_033.client,
    external_url: opts.externalUrl,
    properties: {
      collection: HOOD_TERPS_GENESIS_033.client,
      edition,
      dna: dna.dna,
      environment: HOOD_TERPS_GENESIS_033.environment,
      chainId: HOOD_TERPS_GENESIS_033.chain.chainId,
      traits: {
        presentation: t.presentation,
        terpColorway: t.terpColorway,
        eyeStyle: t.eyeStyle,
        mixedEyePair: t.mixedEyePair,
        bottoms: t.bottoms,
        footwear: t.footwear,
        rarity: t.rarity,
      },
    },
  };
}

export interface MetadataValidation {
  ok: boolean;
  errors: string[];
}

/** Validate a metadata object against the ERC-721/1155-compatible shape. */
export function validateMetadata(meta: HoodTerpsMetadata): MetadataValidation {
  const errors: string[] = [];
  if (!meta.name || typeof meta.name !== "string") errors.push("name is required");
  if (!meta.description || typeof meta.description !== "string") errors.push("description is required");
  if (!meta.image || typeof meta.image !== "string") errors.push("image is required");
  if (!Array.isArray(meta.attributes) || meta.attributes.length === 0) errors.push("attributes must be non-empty");
  if (!meta.dna || typeof meta.dna !== "string") errors.push("dna is required");
  if (!Number.isInteger(meta.edition) || meta.edition < 1) errors.push("edition must be a positive integer");
  if (!meta.collection || typeof meta.collection !== "string") errors.push("collection is required");
  if (!meta.properties || typeof meta.properties !== "object") errors.push("properties is required");
  return { ok: errors.length === 0, errors };
}

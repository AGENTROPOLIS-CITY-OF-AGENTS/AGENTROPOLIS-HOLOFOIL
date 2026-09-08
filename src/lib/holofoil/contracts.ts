import {
  canonicalizeMaterial,
  DEFAULT_MATERIAL,
  hashMaterial,
  type MaterialConfig,
  validateMaterialConfig,
} from "./materials.ts";

/**
 * Integration boundary:
 * Origin Engine approved asset
 *   → Holofoil material configuration
 *   → rendered collectible
 *   → optional ARCANA-54 spatial placement
 *
 * Holofoil does not mint, sign wallets, deploy contracts, or bill generation.
 */

export interface OriginApprovedAsset {
  assetId: string;
  title: string;
  approvedAt: string;
  sourceHash: string;
  artwork: {
    mime: string;
    uri: string;
    width: number;
    height: number;
  };
  metadata: Record<string, unknown>;
  qc: {
    passed: boolean;
    notes: string[];
  };
}

export interface HolofoilRenderedCollectible {
  assetId: string;
  title: string;
  material: MaterialConfig;
  render: {
    foilHash: string;
    width: number;
    height: number;
    schema: "agentropolis.holofoil.render.v1";
  };
  source: {
    originAssetId: string;
    sourceHash: string;
  };
}

export type ArcanaRoom = "arcade" | "relic" | "museum" | "open";

export interface ArcanaSpatialPlacement {
  collectibleId: string;
  worldId: string;
  room: ArcanaRoom;
  transform: {
    x: number;
    y: number;
    z: number;
    yaw: number;
  };
  foilHash: string;
}

export function originToMaterial(
  asset: OriginApprovedAsset,
  override?: Partial<MaterialConfig>,
): MaterialConfig {
  const seed = asset.sourceHash.slice(0, 24) || DEFAULT_MATERIAL.seed;
  const suggested = asset.metadata.foilType;
  return validateMaterialConfig({
    ...DEFAULT_MATERIAL,
    seed,
    ...override,
    foilType:
      typeof suggested === "string" ? suggested : override?.foilType,
  }).value;
}

export function materialToCollectible(
  asset: OriginApprovedAsset,
  material: MaterialConfig,
): HolofoilRenderedCollectible {
  const canonical = canonicalizeMaterial(material);
  return {
    assetId: `holo:${asset.assetId}`,
    title: asset.title,
    material: canonical,
    render: {
      foilHash: hashMaterial(canonical),
      width: asset.artwork.width,
      height: asset.artwork.height,
      schema: "agentropolis.holofoil.render.v1",
    },
    source: {
      originAssetId: asset.assetId,
      sourceHash: asset.sourceHash,
    },
  };
}

export function collectibleToArcanaPlacement(
  collectible: HolofoilRenderedCollectible,
  room: ArcanaRoom = "museum",
  worldId = "arcana-54",
): ArcanaSpatialPlacement {
  const seed = collectible.render.foilHash;
  const n = parseInt(seed.slice(0, 6), 16) || 1;
  return {
    collectibleId: collectible.assetId,
    worldId,
    room,
    transform: {
      x: ((n % 17) - 8) * 1.25,
      y: 1.2,
      z: (((n >> 4) % 13) - 6) * 1.25,
      yaw: (n % 360) * (Math.PI / 180),
    },
    foilHash: collectible.render.foilHash,
  };
}

export const SAMPLE_ORIGIN_ASSET: OriginApprovedAsset = {
  assetId: "origin.ember-fox.001",
  title: "Ember Fox — Specimen 001",
  approvedAt: "2026-09-01T00:00:00.000Z",
  sourceHash: "7c3e91a04b2f88d1c6aa4412",
  artwork: {
    mime: "image/png",
    uri: "holofoil://local/ember-fox",
    width: 1024,
    height: 1434,
  },
  metadata: { foilType: "holographic", district: "creator" },
  qc: { passed: true, notes: ["geometry locked", "palette approved"] },
};

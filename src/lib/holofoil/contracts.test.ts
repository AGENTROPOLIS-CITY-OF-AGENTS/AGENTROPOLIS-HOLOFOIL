import assert from "node:assert/strict";
import test from "node:test";
import {
  collectibleToArcanaPlacement,
  materialToCollectible,
  originToMaterial,
  SAMPLE_ORIGIN_ASSET,
} from "./contracts.ts";

test("origin to material to collectible to arcana placement", () => {
  const material = originToMaterial(SAMPLE_ORIGIN_ASSET);
  const collectible = materialToCollectible(SAMPLE_ORIGIN_ASSET, material);
  const placement = collectibleToArcanaPlacement(collectible, "museum");
  assert.equal(material.seed.startsWith("7c3e91a04b2f88d1c6aa"), true);
  assert.equal(collectible.source.originAssetId, SAMPLE_ORIGIN_ASSET.assetId);
  assert.equal(collectible.render.schema, "agentropolis.holofoil.render.v1");
  assert.equal(placement.room, "museum");
  assert.equal(placement.foilHash, collectible.render.foilHash);
});

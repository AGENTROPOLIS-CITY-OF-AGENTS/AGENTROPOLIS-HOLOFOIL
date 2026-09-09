import assert from "node:assert/strict";
import test from "node:test";
import {
  addToLoadout,
  collect,
  identityContinuity,
  initialProof,
  materialFor,
  openReceipt,
  proofReceipt,
  revealReward,
  startEncounter,
  strike,
  summon,
} from "./fixture.ts";
import { PROOF_ENTITY, PROOF_ENTITY_ID, sameCanonicalEntity } from "./game-entity.ts";

test("canonical entity id is identical across card, loadout, battle, reward, collection", () => {
  let state = initialProof();
  assert.equal(state.entity.id, PROOF_ENTITY_ID);
  assert.equal(sameCanonicalEntity(state.entity, PROOF_ENTITY), true);
  state = addToLoadout(state);
  state = startEncounter(state);
  state = summon(state);
  state = strike(state);
  state = revealReward(state);
  state = collect(state);
  const ids = identityContinuity(state);
  assert.deepEqual(ids, [PROOF_ENTITY_ID]);
  assert.equal(state.combat?.entityId, PROOF_ENTITY_ID);
  assert.deepEqual(state.loadout, [PROOF_ENTITY_ID]);
  assert.deepEqual(state.collection, [PROOF_ENTITY_ID]);
  assert.equal(state.selected, PROOF_ENTITY_ID);
});

test("holofoil material is deterministic from entity id", () => {
  const a = materialFor(PROOF_ENTITY);
  const b = materialFor(PROOF_ENTITY);
  assert.equal(a.seed, PROOF_ENTITY_ID);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test("ARCANA fixture decides combat; wallet stays off", () => {
  let state = initialProof();
  state = addToLoadout(state);
  state = startEncounter(state);
  state = summon(state);
  state = strike(state);
  assert.equal(state.combat?.decidedBy, "ARCANA_FIXTURE");
  assert.equal(state.combat?.outcome, "WIN");
  assert.equal(state.combat?.dataSource, "FIXTURE");
  state = revealReward(state);
  state = collect(state);
  state = openReceipt(state);
  const receipt = proofReceipt(state);
  assert.equal(receipt.wallet, "OFF");
  assert.equal(receipt.minting, "OFF");
  assert.equal(receipt.entity_id, PROOF_ENTITY_ID);
  assert.deepEqual(receipt.identity_ids, [PROOF_ENTITY_ID]);
});

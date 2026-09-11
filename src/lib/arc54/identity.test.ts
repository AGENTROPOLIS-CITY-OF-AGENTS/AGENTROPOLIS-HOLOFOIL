import assert from "node:assert/strict";
import test from "node:test";
import { assertHoodTerpsHolofoilBinding } from "../../../contracts/hood-terps-holofoil-binding.v1.ts";
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
import {
  PLACEHOLDER,
  holofoilSeedFromIdentity,
  hoodTerpsHolofoilBinding,
  identityChain,
  PROOF_RECORD,
} from "./hood-terps.ts";

test("canonical entity id is identical across source, creator, arcana, holofoil, battle, reward, collection", () => {
  const chain = identityChain();
  const ids = Object.values(chain);
  assert.equal(new Set(ids).size, 1);
  assert.equal(ids[0], PROOF_ENTITY_ID);
  assert.equal(PROOF_RECORD.source.entityId, PROOF_ENTITY_ID);
  assert.equal(PROOF_RECORD.creator.entityId, PROOF_ENTITY_ID);

  let state = initialProof();
  assert.equal(sameCanonicalEntity(state.entity, PROOF_ENTITY), true);
  state = addToLoadout(state);
  state = startEncounter(state);
  state = summon(state);
  state = strike(state);
  state = revealReward(state);
  state = collect(state);
  assert.deepEqual(identityContinuity(state), [PROOF_ENTITY_ID]);
  assert.equal(state.combat?.entityId, PROOF_ENTITY_ID);
  assert.deepEqual(state.collection, [PROOF_ENTITY_ID]);
});

test("holofoil material seed is entityId + DNA and is deterministic", () => {
  const expected = holofoilSeedFromIdentity(PROOF_ENTITY_ID, PLACEHOLDER);
  const a = materialFor(PROOF_ENTITY);
  const b = materialFor(PROOF_ENTITY);
  assert.equal(a.seed, expected);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assertHoodTerpsHolofoilBinding(hoodTerpsHolofoilBinding());
});

test("ARCANA fixture decides combat; wallet stays off; DNA is not invented", () => {
  let state = initialProof();
  state = addToLoadout(state);
  state = startEncounter(state);
  state = summon(state);
  state = strike(state);
  assert.equal(state.combat?.decidedBy, "ARCANA_FIXTURE");
  assert.equal(state.combat?.dataSource, "FIXTURE");
  state = revealReward(state);
  state = collect(state);
  state = openReceipt(state);
  const receipt = proofReceipt(state);
  assert.equal(receipt.wallet, "OFF");
  assert.equal(receipt.minting, "OFF");
  assert.equal(receipt.entity_id, PROOF_ENTITY_ID);
  assert.equal(receipt.dna, PLACEHOLDER);
  assert.equal(PROOF_RECORD.hoodTerps.genetics.type, PLACEHOLDER);
  assert.equal(PROOF_RECORD.hoodTerps.genetics.parentage, null);
  assert.equal(PROOF_RECORD.source.supplyCap, 3333);
});

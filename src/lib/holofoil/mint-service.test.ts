import assert from "node:assert/strict";
import test from "node:test";
import { applyAgentCommand } from "../creator-cloud/agent.ts";
import { deriveDrop } from "../creator-cloud/drop.ts";
import { assertNoFakeScarcity } from "../creator-cloud/launch.ts";
import { initialWorkspace } from "../creator-cloud/workspace.ts";
import { canPresentAsLive } from "../../contracts/drop-mode.v1.ts";
import { mintReceiptFromPrep, prepareMint } from "./mint-service.ts";

test("unverified drop cannot present live scarcity", () => {
  const drop = deriveDrop(initialWorkspace());
  assert.equal(drop.state, "DRAFT");
  assert.equal(drop.progress.verified, false);
  assert.equal(drop.progress.remaining, undefined);
  assert.equal(canPresentAsLive(drop), false);
  assert.doesNotThrow(() => assertNoFakeScarcity(drop.progress));
});

test("agent launch operator inspects phases without execution", () => {
  const { message, changed } = applyAgentCommand(initialWorkspace(), "Show me the launch phases.");
  assert.equal(changed, false);
  assert.match(message, /SIMPLE_DROP/);
});

test("genesis recipe is applied deterministically", () => {
  const { state } = applyAgentCommand(initialWorkspace(), "Use the genesis drop recipe.");
  assert.equal(state.launch.recipe, "GENESIS_DROP");
  assert.equal(state.launch.phases.length, 3);
});

test("hood terps mint without wallet stays WALLET_REQUIRED", () => {
  const prep = prepareMint({
    version: "1.0.0",
    projectId: "hood-terps",
    collectionId: "hood-terps:collection",
    quantity: 1,
  });
  assert.equal(prep.state, "WALLET_REQUIRED");
  assert.equal(prep.transactionRequest, null);
  assert.equal(prep.contract, undefined);
});

test("hood terps mint with account stays SIMULATION and never CONFIRMED", () => {
  const req = {
    version: "1.0.0" as const,
    projectId: "hood-terps",
    collectionId: "hood-terps:collection",
    quantity: 1,
    recipient: "0xuser",
  };
  const prep = prepareMint(req);
  assert.equal(prep.state, "SIMULATING");
  assert.equal(prep.approvalState, "BLOCKED");
  const receipt = mintReceiptFromPrep(req, prep);
  assert.equal(receipt.status, "BLOCKED");
  assert.equal(receipt.transactionHash, undefined);
  assert.equal(receipt.tokenIds, undefined);
});

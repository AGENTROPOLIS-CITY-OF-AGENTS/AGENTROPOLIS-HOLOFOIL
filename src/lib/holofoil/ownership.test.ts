import assert from "node:assert/strict";
import test from "node:test";
import { addToken, createHolderVault, ownerOf } from "./holder-vault.ts";
import { applyTransfer } from "./ownership.ts";

test("ownership transitions are recorded correctly across a chain", () => {
  let vault = createHolderVault();
  vault = addToken(vault, "tok-1", "0xalice");

  const toBob = applyTransfer(vault, {
    from: "0xalice",
    to: "0xbob",
    tokenId: "tok-1",
    blockNumber: 100,
  });
  assert.equal(toBob, "0xbob");
  assert.equal(ownerOf(vault, "tok-1"), "0xbob");

  const toCarol = applyTransfer(vault, {
    from: "0xbob",
    to: "0xcarol",
    tokenId: "tok-1",
    blockNumber: 200,
  });
  assert.equal(toCarol, "0xcarol");
  assert.equal(ownerOf(vault, "tok-1"), "0xcarol");
});

test("transfer from a non-owner is rejected and ownership is unchanged", () => {
  let vault = createHolderVault();
  vault = addToken(vault, "tok-1", "0xalice");

  assert.throws(
    () =>
      applyTransfer(vault, {
        from: "0xmallory",
        to: "0xbob",
        tokenId: "tok-1",
        blockNumber: 300,
      }),
    /HOLOFOIL_VAULT_NOT_OWNER/,
  );
  assert.equal(ownerOf(vault, "tok-1"), "0xalice");
});

test("transfer of an unregistered token is rejected", () => {
  const vault = createHolderVault();
  assert.throws(
    () =>
      applyTransfer(vault, {
        from: "0xalice",
        to: "0xbob",
        tokenId: "tok-ghost",
        blockNumber: 400,
      }),
    /HOLOFOIL_VAULT_TOKEN_UNKNOWN/,
  );
});

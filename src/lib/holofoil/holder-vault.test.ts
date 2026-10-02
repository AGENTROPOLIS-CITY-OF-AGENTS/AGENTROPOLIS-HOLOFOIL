import assert from "node:assert/strict";
import test from "node:test";
import {
  addToken,
  createHolderVault,
  hasToken,
  ownerOf,
  transferToken,
  vaultSize,
} from "./holder-vault.ts";

test("holder vault registers and queries a token", () => {
  const vault = createHolderVault();
  const next = addToken(vault, "tok-1", "0xalice");
  assert.equal(ownerOf(next, "tok-1"), "0xalice");
  assert.equal(hasToken(next, "tok-1"), true);
  assert.equal(vaultSize(next), 1);
  assert.equal(ownerOf(next, "tok-missing"), undefined);
});

test("holder vault transfer updates the owner", () => {
  let vault = createHolderVault();
  vault = addToken(vault, "tok-1", "0xalice");
  const newOwner = transferToken(vault, "tok-1", "0xalice", "0xbob");
  assert.equal(newOwner, "0xbob");
  assert.equal(ownerOf(vault, "tok-1"), "0xbob");
});

test("holder vault rejects transfer from a non-owner", () => {
  let vault = createHolderVault();
  vault = addToken(vault, "tok-1", "0xalice");
  assert.throws(
    () => transferToken(vault, "tok-1", "0xmallory", "0xbob"),
    /HOLOFOIL_VAULT_NOT_OWNER/,
  );
  assert.equal(ownerOf(vault, "tok-1"), "0xalice");
});

test("holder vault rejects transfer of an unknown token", () => {
  const vault = createHolderVault();
  assert.throws(
    () => transferToken(vault, "tok-ghost", "0xalice", "0xbob"),
    /HOLOFOIL_VAULT_TOKEN_UNKNOWN/,
  );
});

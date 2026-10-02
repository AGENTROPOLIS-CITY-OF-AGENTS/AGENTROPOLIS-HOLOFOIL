import assert from "node:assert/strict";
import test from "node:test";
import type { HolofoilMintReceiptV1 } from "../../contracts/mint.v1.ts";
import { createHolderVault, ownerOf, vaultSize } from "./holder-vault.ts";
import { ingestMintReceipt } from "./mint-receipt-ingest.ts";

function confirmedReceipt(overrides: Partial<HolofoilMintReceiptV1> = {}): HolofoilMintReceiptV1 {
  return {
    version: "1.0.0",
    requestId: "mint-hood-terps-hood-terps:collection-1",
    projectId: "hood-terps",
    collectionId: "hood-terps:collection",
    chainId: "testnet-1",
    transactionHash: "0xabc123",
    tokenIds: ["tok-1", "tok-2"],
    metadataRefs: ["meta-1", "meta-2"],
    provenanceRefs: ["prov-1", "prov-2"],
    confirmedAt: "2026-10-02T00:00:00.000Z",
    status: "CONFIRMED",
    note: "minted",
    ...overrides,
  };
}

test("unverified (non-CONFIRMED) receipt is rejected", () => {
  const vault = createHolderVault();
  const receipt = confirmedReceipt({ status: "SIMULATED" });
  assert.throws(
    () => ingestMintReceipt(vault, receipt, "0xalice"),
    /HOLOFOIL_INGEST_RECEIPT_UNVERIFIED/,
  );
  assert.equal(vaultSize(vault), 0);
});

test("empty receipt (no tokenIds) is rejected", () => {
  const vault = createHolderVault();
  const receipt = confirmedReceipt({ tokenIds: [] });
  assert.throws(
    () => ingestMintReceipt(vault, receipt, "0xalice"),
    /HOLOFOIL_INGEST_RECEIPT_EMPTY/,
  );
  assert.equal(vaultSize(vault), 0);
});

test("valid CONFIRMED receipt registers ownership to the recipient", () => {
  const vault = createHolderVault();
  const receipt = confirmedReceipt();
  const { registered, vault: next } = ingestMintReceipt(vault, receipt, "0xalice");
  assert.deepEqual(registered, ["tok-1", "tok-2"]);
  assert.equal(ownerOf(next, "tok-1"), "0xalice");
  assert.equal(ownerOf(next, "tok-2"), "0xalice");
  assert.equal(vaultSize(next), 2);
});

test("ingestion only registers tokenIds the receipt provides (no invented ids)", () => {
  const vault = createHolderVault();
  const receipt = confirmedReceipt({ tokenIds: ["tok-7"] });
  const { registered, vault: next } = ingestMintReceipt(vault, receipt, "0xbob");
  assert.deepEqual(registered, ["tok-7"]);
  assert.equal(ownerOf(next, "tok-7"), "0xbob");
  // No token beyond the receipt's tokenIds is registered.
  assert.equal(vaultSize(next), 1);
  assert.equal(ownerOf(next, "tok-1"), undefined);
});

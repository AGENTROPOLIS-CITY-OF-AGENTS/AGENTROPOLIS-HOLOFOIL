/**
 * Testnet mint receipt ingestion.
 *
 * Pure function that ingests a HolofoilMintReceiptV1 and registers the minted
 * tokenIds to the recipient in the Holder Vault. It NEVER invents hashes or
 * tokenIds — only the tokenIds the receipt actually provides are registered.
 * An unverified (non-CONFIRMED) or empty receipt is rejected.
 */
import type { HolofoilMintReceiptV1 } from "../../contracts/mint.v1.ts";
import type { HolderVault } from "./holder-vault.ts";
import { addToken } from "./holder-vault.ts";

export interface MintIngestResult {
  /** The tokenIds that were registered to the recipient. */
  registered: string[];
  /** The updated vault. */
  vault: HolderVault;
}

/**
 * Register the minted tokenIds from a CONFIRMED receipt to the recipient.
 * Throws HOLOFOIL_INGEST_RECEIPT_UNVERIFIED for non-CONFIRMED receipts and
 * HOLOFOIL_INGEST_RECEIPT_EMPTY when the receipt carries no tokenIds.
 */
export function ingestMintReceipt(
  vault: HolderVault,
  receipt: HolofoilMintReceiptV1,
  recipient: string,
): MintIngestResult {
  if (receipt.status !== "CONFIRMED") {
    throw new Error("HOLOFOIL_INGEST_RECEIPT_UNVERIFIED");
  }
  if (!recipient) {
    throw new Error("HOLOFOIL_INGEST_RECIPIENT_REQUIRED");
  }
  const tokenIds = receipt.tokenIds ?? [];
  if (tokenIds.length === 0) {
    throw new Error("HOLOFOIL_INGEST_RECEIPT_EMPTY");
  }
  let next = vault;
  for (const tokenId of tokenIds) {
    next = addToken(next, tokenId, recipient);
  }
  return { registered: [...tokenIds], vault: next };
}

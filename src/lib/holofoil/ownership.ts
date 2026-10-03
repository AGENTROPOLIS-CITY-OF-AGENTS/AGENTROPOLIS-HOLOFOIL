/**
 * Transfer-aware ownership tracking.
 *
 * Given a transfer event, updates the Holder Vault and returns the new owner.
 * A transfer from a non-owner (or of an unknown token) is rejected.
 */
import type { HolderVault } from "./holder-vault.ts";
import { transferToken } from "./holder-vault.ts";

export interface HolofoilTransferEvent {
  from: string;
  to: string;
  tokenId: string;
  blockNumber: number;
}

/**
 * Apply a transfer event to the vault and return the new owner.
 * Throws HOLOFOIL_VAULT_NOT_OWNER / HOLOFOIL_VAULT_TOKEN_UNKNOWN when the
 * transfer is not authorized by the current ownership state.
 */
export function applyTransfer(
  vault: HolderVault,
  event: HolofoilTransferEvent,
): string {
  return transferToken(vault, event.tokenId, event.from, event.to);
}

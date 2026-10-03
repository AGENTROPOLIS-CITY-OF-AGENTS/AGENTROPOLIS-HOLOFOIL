/**
 * Holder Vault — an in-memory (pure TS) ownership registry.
 *
 * Maps tokenId -> holder address. All operations are synchronous and
 * side-effect free with respect to the outside world; the vault is the
 * single source of truth for offline ownership tracking.
 */

export interface HolderVault {
  /** tokenId -> holder address. */
  readonly owners: ReadonlyMap<string, string>;
}

export function createHolderVault(): HolderVault {
  return { owners: new Map<string, string>() };
}

/** Register a token to a holder. Overwrites any prior holder. */
export function addToken(vault: HolderVault, tokenId: string, holder: string): HolderVault {
  if (!tokenId) throw new Error("HOLOFOIL_VAULT_TOKEN_REQUIRED");
  if (!holder) throw new Error("HOLOFOIL_VAULT_HOLDER_REQUIRED");
  const owners = new Map(vault.owners);
  owners.set(tokenId, holder);
  return { owners };
}

/** Return the current holder of a token, or undefined if unregistered. */
export function ownerOf(vault: HolderVault, tokenId: string): string | undefined {
  return vault.owners.get(tokenId);
}

/** True if the token is registered in the vault. */
export function hasToken(vault: HolderVault, tokenId: string): boolean {
  return vault.owners.has(tokenId);
}

/** Number of registered tokens. */
export function vaultSize(vault: HolderVault): number {
  return vault.owners.size;
}

/**
 * Transfer a token from one holder to another.
 * Throws if the token is unknown or the `from` address is not the current holder.
 * Returns the new holder.
 */
export function transferToken(
  vault: HolderVault,
  tokenId: string,
  from: string,
  to: string,
): string {
  const current = vault.owners.get(tokenId);
  if (current === undefined) {
    throw new Error("HOLOFOIL_VAULT_TOKEN_UNKNOWN");
  }
  if (current !== from) {
    throw new Error("HOLOFOIL_VAULT_NOT_OWNER");
  }
  if (!to) {
    throw new Error("HOLOFOIL_VAULT_HOLDER_REQUIRED");
  }
  const owners = new Map(vault.owners);
  owners.set(tokenId, to);
  // Mutate in place so the same vault instance reflects the transition.
  (vault as { owners: Map<string, string> }).owners = owners;
  return to;
}

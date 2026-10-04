export type ClaimChain = "EVM" | "SOLANA" | "XRPL" | "OTHER";
export type ClaimMode = "PER_HOLDER" | "PER_TOKEN" | "PER_WALLET" | "PROJECT_RULE";
export type ClaimStatus = "PENDING" | "VERIFIED" | "CLAIMED" | "DENIED" | "REVOKED";

export interface HolofoilHolderEntitlement {
  claimId: string;
  projectId: string;
  gameId: string;
  chain: ClaimChain;
  network?: string;
  collectionId: string;
  tokenId?: string | null;
  walletAddress: string;
  walletProofId: string;
  mode: ClaimMode;
  cardObjectId: string;
  claimLimit: number;
  transferableInGame?: boolean;
  ownershipVerified: boolean;
  verificationMethod: "SERVER_CHAIN_QUERY" | "INDEXER_QUERY" | "SIGNED_ATTESTATION";
  verificationReference: string;
  verifiedAt: string;
  status: ClaimStatus;
  receiptId?: string | null;
  claimedAt?: string | null;
}

export interface HolderClaimResolver {
  resolveEntitlement(input: {
    projectId: string;
    gameId: string;
    walletAddress: string;
    tokenId?: string | null;
  }): Promise<HolofoilHolderEntitlement>;
}

/**
 * HOLOFOIL never treats browser-provided ownership as truth.
 * Entitlements must be resolved by an approved server-side verifier.
 */
export function isClaimRenderable(entitlement: HolofoilHolderEntitlement) {
  return entitlement.ownershipVerified && ["VERIFIED", "CLAIMED"].includes(entitlement.status);
}

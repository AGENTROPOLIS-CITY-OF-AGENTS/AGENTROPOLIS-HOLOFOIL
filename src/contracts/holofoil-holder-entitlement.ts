export type ClaimMode = "PER_HOLDER" | "PER_DISCORD_USER" | "PROJECT_RULE";
export type ClaimStatus = "PENDING" | "VERIFIED" | "CLAIMED" | "DENIED" | "REVOKED";

export interface HolofoilHolderEntitlement {
  claimId: string;
  projectId: string;
  gameId: string;

  discordUserId: string;
  discordGuildId: string;
  requiredRoleIds: string[];

  mode: ClaimMode;
  cardObjectId: string;
  claimLimit: number;
  transferableInGame?: boolean;

  membershipVerified: boolean;
  roleVerified: boolean;
  verificationMethod:
    | "DISCORD_OAUTH_GUILD_ROLE"
    | "DISCORD_BOT_GUILD_ROLE"
    | "SIGNED_PROJECT_ATTESTATION";
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
    discordUserId: string;
  }): Promise<HolofoilHolderEntitlement>;
}

/**
 * HOLOFOIL never trusts client-supplied roles.
 * Eligibility must come from an approved server-side Discord/project verifier.
 */
export function isClaimRenderable(entitlement: HolofoilHolderEntitlement) {
  return (
    entitlement.membershipVerified &&
    entitlement.roleVerified &&
    ["VERIFIED", "CLAIMED"].includes(entitlement.status)
  );
}

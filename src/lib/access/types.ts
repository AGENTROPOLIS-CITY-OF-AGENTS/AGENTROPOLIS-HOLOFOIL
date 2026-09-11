export const CAPABILITIES = [
  "holofoil.material.use",
  "holofoil.card-studio.use",
  "holofoil.3d-stage.use",
  "holofoil.project.create",
  "origin.playable-slice.request",
  "creator.game-package.request",
  "internal.proofs.view",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export type Membership = "NONE" | "MEMBER";

export type AccessClass = "GUEST" | "MEMBER" | "INTERNAL";

/** Membership produces entitlements. Entitlements produce capability access. Mandate still owns authority. */
export interface AccessContext {
  authenticated: boolean;
  membership: Membership;
  internal: boolean;
  capabilities: Capability[];
  /** Session identity source. Entitlements in this slice are fixture-labeled. */
  authSource: "NONE" | "SESSION" | "DEV_FALLBACK";
  entitlementSource: "FIXTURE";
}

export const MEMBER_CAPABILITIES: Capability[] = [
  "holofoil.material.use",
  "holofoil.card-studio.use",
  "holofoil.3d-stage.use",
  "holofoil.project.create",
];

export const INTERNAL_CAPABILITIES: Capability[] = [
  ...MEMBER_CAPABILITIES,
  "origin.playable-slice.request",
  "creator.game-package.request",
  "internal.proofs.view",
];

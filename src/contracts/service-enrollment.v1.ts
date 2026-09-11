export const SERVICE_ENROLLMENT_VERSION = "holofoil.service-enrollment.v1" as const;
export const CLIENT_WORKSPACE_VERSION = "holofoil.client-workspace.v1" as const;
export const WORK_PROOF_VIDEO_VERSION = "holofoil.work-proof-video.v1" as const;

export const HOLOFOIL_SERVICE_IDS = [
  "DROP_CREATION",
  "COLLECTION_GENERATION",
  "MINT_SERVICE",
  "LIVE_SESH_SOCIAL_GAMES",
  "TCG_GAME_SERVICES",
  "IP_EQUITY_ENGINE",
  "RECONSTRUCT_ASSETS",
] as const;

export type HolofoilServiceId = (typeof HOLOFOIL_SERVICE_IDS)[number];

export type NeuroConciergeAssignmentV1 = {
  version: typeof SERVICE_ENROLLMENT_VERSION;
  canonicalIdentity: "NEURO";
  mode: "HOLOFOIL_CONCIERGE";
  displayName: "NEURO";
  userId: string;
  role: "AGENT_CONCIERGE";
  authority: "GUIDANCE_AND_ROUTING_ONLY";
  assignedAt: string;
};

export type HolofoilServiceEnrollmentV1 = {
  version: typeof SERVICE_ENROLLMENT_VERSION;
  enrollmentId: string;
  workspaceId: string;
  userId: string;
  serviceIds: HolofoilServiceId[];
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CANCELLED";
  createdAt: string;
  concierge: NeuroConciergeAssignmentV1;
};

export const CLIENT_ROLES = [
  "FOUNDER",
  "ADMIN",
  "CREATIVE",
  "TECHNICAL",
  "COMMUNITY",
  "FINANCE",
  "VIEWER",
] as const;

export type ClientRole = (typeof CLIENT_ROLES)[number];

export type ClientProfileV1 = {
  userId: string;
  displayName: string;
  email: string | null;
  role: ClientRole;
  title?: string;
  permissions: string[];
};

export type ClientWorkspaceV1 = {
  version: typeof CLIENT_WORKSPACE_VERSION;
  workspaceId: string;
  name: string;
  founder: ClientProfileV1;
  team: ClientProfileV1[];
  planId: "INDIVIDUAL" | "STUDIO" | "TEAM" | "ORGANIZATION";
  projectIds: string[];
  createdAt: string;
};

export type WorkProofFrameV1 = {
  order: number;
  screenshotRef: string;
  caption: string;
  agentLabel: string;
  receiptRefs: string[];
  state: "CAPTURED" | "VERIFIED" | "UNVERIFIED";
};

export type WorkProofVideoV1 = {
  version: typeof WORK_PROOF_VIDEO_VERSION;
  videoId: string;
  workspaceId: string;
  projectId: string;
  title: string;
  frames: WorkProofFrameV1[];
  narration?: string[];
  generatedAt: string;
  disclosure: "COMPOSITE_OF_CAPTURED_WORK";
};

export type IpEquityProgramMode =
  | "OFF"
  | "COLLECTOR_RIGHTS"
  | "COMMERCIAL_LICENSE"
  | "EARN_TO_LICENSE"
  | "REVENUE_PARTICIPATION"
  | "CUSTOM_RIGHTS";

export type IpEquityServiceConfigV1 = {
  version: "holofoil.ip-equity-service.v1";
  projectId: string;
  ipOwnerName: string;
  mode: IpEquityProgramMode;
  rightsPoolEnabled: boolean;
  contributionTrackingEnabled: boolean;
  agreementRequired: boolean;
  ownershipTransferEnabled: boolean;
  notes?: string;
};

/** Enrollment never grants mint, wallet, spending, publishing, or IP ownership authority. */
export function assertEnrollmentHasNoExecutionAuthority(
  enrollment: HolofoilServiceEnrollmentV1,
): true {
  if (enrollment.concierge.authority !== "GUIDANCE_AND_ROUTING_ONLY") {
    throw new Error("NEURO concierge cannot receive execution authority from service enrollment");
  }
  return true;
}

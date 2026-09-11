export const FOUNDER_INTAKE_VERSION = "holofoil.founder-intake.v1" as const;
export const LAUNCH_PACKAGE_VERSION = "holofoil.founder-launch-package.v1" as const;

export type FactStatus =
  | "VERIFIED"
  | "FOUND"
  | "PROPOSED"
  | "MISSING"
  | "CONFLICT"
  | "APPROVAL_REQUIRED"
  | "DRAFT"
  | "UNVERIFIED";

export type RequirementClass = "AUTO" | "REVIEW" | "FOUNDER_ONLY";

export type IntakePath = "UPLOAD" | "TELL_NEURO" | "GUIDED" | "HOOD_TERPS_SEED";

export type AssetClass =
  | "ARCHIVE"
  | "DOCUMENT"
  | "DECK"
  | "SPREADSHEET"
  | "METADATA"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "MODEL_3D"
  | "BRAND"
  | "CONTRACT"
  | "LORE"
  | "UNKNOWN"
  | "REJECTED";

export interface ProjectFactV1 {
  id: string;
  key: string;
  value: string;
  status: FactStatus;
  sourceRef: string;
  sourceKind: "UPLOAD" | "CONVERSATION" | "GUIDED" | "SYSTEM" | "CLIENT_REPO";
  confidence: number;
  ownership: RequirementClass;
  updatedAt: string;
}

export interface FileInventoryItemV1 {
  id: string;
  filename: string;
  ext: string;
  bytes: number;
  mime: string;
  assetClass: AssetClass;
  status: FactStatus;
  rejectedReason?: string;
}

export interface TimelineEventV1 {
  id: string;
  at: string;
  label: string;
  agentLabel: "NEURO" | "HOLOFOIL";
  receiptRef?: string;
  screenshotRef?: string;
  state: "CAPTURED" | "VERIFIED" | "UNVERIFIED";
}

export interface FounderLaunchPackageV1 {
  version: typeof LAUNCH_PACKAGE_VERSION;
  projectId: string;
  founderIdentity: FactStatus;
  projectIdentity: FactStatus;
  ipOwnership: FactStatus;
  team: FactStatus;
  artwork: FactStatus;
  traits: FactStatus;
  metadata: FactStatus;
  gameUtility: FactStatus;
  rights: FactStatus;
  launchPhases: FactStatus;
  pricing: FactStatus;
  supply: FactStatus;
  chain: FactStatus;
  testnet: FactStatus;
  marketplace: FactStatus;
  approvals: FactStatus;
}

export const ROBINHOOD_TESTNET = {
  label: "Robinhood Chain Testnet",
  chainId: 46630,
  environment: "TESTNET",
} as const;

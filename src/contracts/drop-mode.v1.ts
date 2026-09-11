import type { LaunchPlan, DropProgress } from "../lib/creator-cloud/launch.ts";

export type DropStateLabel =
  | "DRAFT"
  | "SIMULATION"
  | "UPCOMING"
  | "LIVE"
  | "SOLD_OUT"
  | "ENDED"
  | "UNVERIFIED";

export interface MarketplaceRoute {
  label: string;
  href: string;
  verified: boolean;
}

export interface HolofoilDropModeV1 {
  version: "1.0.0";
  projectId: string;
  collectionName: string;
  state: DropStateLabel;
  destination: "WEB2_ONLY" | "WEB3" | "HYBRID";
  networkLabel?: string;
  launch: LaunchPlan;
  progress: DropProgress;
  primaryAction:
    | "NOTIFY_ME"
    | "EARLY_ACCESS"
    | "COLLECT"
    | "VIEW_COLLECTION"
    | "NONE";
  marketplaceRoutes: MarketplaceRoute[];
  provenanceRef?: string;
  executionEnvelopeRef?: string;
}

export interface DropModeReceiptV1 {
  version: "1.0.0";
  projectId: string;
  generatedAt: string;
  state: DropStateLabel;
  verifiedFields: string[];
  draftFields: string[];
  sourceRefs: string[];
  quantization: {
    threeLoadedBeforeIntent: boolean;
    web3LoadedBeforeIntent: boolean;
    agentToolingLoadedBeforeIntent: boolean;
  };
}

export function canPresentAsLive(drop: HolofoilDropModeV1): boolean {
  return (
    drop.state === "LIVE" &&
    drop.progress.verified &&
    Boolean(drop.progress.source)
  );
}

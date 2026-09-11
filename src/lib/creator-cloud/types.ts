import type { FoilType } from "../holofoil/materials.ts";
import type { CreatorCloudJobV1, TraitRule } from "../../contracts/creator-cloud-job.v1.ts";

export type LayerSource = "SAMPLE" | "UPLOAD";

export interface LayerAsset {
  id: string;
  group: string;
  value: string;
  src: string;
  z: number;
  visible: boolean;
  locked: boolean;
  source: LayerSource;
  filename?: string;
}

export interface GeneratedItem {
  index: number;
  dna: string;
  traits: Record<string, string>;
  layerIds: string[];
}

export interface CapacityReport {
  possible: number;
  requested: number;
  safe: boolean;
  uniqueRequired: boolean;
  estimated: boolean;
  message: string;
}

export interface ValidationReport {
  uniqueOk: boolean;
  duplicateCount: number;
  invalidCount: number;
  blockers: string[];
}

export interface LaunchEstimate {
  setup: number;
  storage: number;
  network: number;
  optional: number;
  total: number;
  currency: "USD";
  note: string;
}

export interface WorkspaceState {
  job: CreatorCloudJobV1;
  layers: LayerAsset[];
  rules: TraitRule[];
  seed: string;
  uniqueRequired: boolean;
  foilEnabled: boolean;
  foilType: FoilType;
  ideaText: string;
  priceDisplay: string;
  earlyAccess: string;
  earningsPercent: number;
  destination: "WEB2_ONLY" | "WEB3";
  generated: GeneratedItem[];
  agentLog: string[];
  step: number;
}

export const COLLECTION_TYPE_OPTIONS = [
  { id: "DIGITAL_ART", label: "Digital art collection" },
  { id: "TRADING_CARDS", label: "Trading cards" },
  { id: "AVATAR_COLLECTION", label: "Avatar collection" },
  { id: "GAME_ITEMS", label: "Game items" },
  { id: "MEMBERSHIP_PASS", label: "Membership / access pass" },
  { id: "LIMITED_DROP", label: "Limited-edition drop" },
  { id: "UNDECIDED", label: "I'm not sure — help me build it" },
] as const;

export const SUPPLY_PRESETS = [333, 669, 933, 3333] as const;
export const STEPS = ["Idea", "Artwork", "Mix", "Generate", "Price", "Publish"] as const;
export const PREVIEW_CAP = 12;

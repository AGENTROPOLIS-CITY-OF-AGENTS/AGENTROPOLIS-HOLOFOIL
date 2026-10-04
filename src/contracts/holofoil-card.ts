export type HolofoilLayout = "fan" | "stack" | "grid" | "list" | "inspect";

export type HolofoilStatus =
  | "ACTIVE"
  | "LOCKED"
  | "PENDING"
  | "BLOCKED"
  | "UNAVAILABLE";

export type HolofoilRarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY"
  | "MYTHIC"
  | string;

export interface HolofoilGameContext {
  gameId: string;
  gameName: string;
  worldId?: string;
  districtId?: string;
  factionId?: string;
  gamingDistrictGameId?: string;
}

export interface HolofoilProvenance {
  receiptId?: string;
  sourceId?: string;
  verified?: boolean;
  fixture?: boolean;
  authorityStatus?: "VERIFIED" | "PENDING" | "BLOCKED" | "UNKNOWN";
}

export interface HolofoilMaterialConfig {
  preset?: string;
  intensity?: number;
  refraction?: number;
  shimmer?: number;
  foilDepth?: number;
  accent?: string;
}

export interface HolofoilCardData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc: string;
  backImageSrc?: string;
  href?: string;

  game: HolofoilGameContext;
  rarity?: HolofoilRarity;
  status?: HolofoilStatus;
  cardType?: string;
  faction?: string;
  series?: string;
  stats?: Record<string, string | number>;
  tags?: string[];

  provenance?: HolofoilProvenance;

  /**
   * Presentation only. These values MUST NOT alter gameplay truth.
   */
  holofoil?: HolofoilMaterialConfig;

  /**
   * Game-specific extension data. HOLOFOIL may expose this to a game renderer
   * but MUST NOT infer authority or gameplay state from it.
   */
  metadata?: Record<string, unknown>;
}

export const HOLOFOIL_FAN_PRESET = Object.freeze({
  maxVisible: 7,
  spreadDeg: 42,
  activeScale: 1,
  edgeScale: 0.775,
  perspectivePx: 1100,
  depthPx: 90,
});

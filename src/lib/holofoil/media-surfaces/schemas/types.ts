export const MEDIA_TYPES = ["video", "image", "stream"] as const;
export type HolofoilMediaType = (typeof MEDIA_TYPES)[number];

export const SURFACE_FORMATS = [
  "rooftop",
  "wall",
  "street",
  "portrait",
  "landscape",
  "cinema",
  "storefront",
  "transit",
  "custom",
] as const;
export type HolofoilSurfaceFormat = (typeof SURFACE_FORMATS)[number];

export const INTERACTION_MODES = ["none", "focus", "expand", "portal"] as const;
export type HolofoilInteractionMode = (typeof INTERACTION_MODES)[number];

export const MODERATION_STATUSES = ["pending", "approved", "rejected", "restricted"] as const;
export type HolofoilModerationStatus = (typeof MODERATION_STATUSES)[number];

export type HolofoilMediaRecord = {
  id: string;
  source: string;
  mediaType: HolofoilMediaType;
  poster?: string;
  title?: string;
  description?: string;
  altText?: string;
  captions?: string;
  transcript?: string;
  aspectRatio?: number;
  loop?: boolean;
  mutedByDefault?: boolean;
  audioEligible?: boolean;
  priority?: number;
  tags?: string[];
  placementGroup?: string;
  schedule?: { startsAt?: string; endsAt?: string };
  rights?: {
    owner?: string;
    license?: string;
    sourceUrl?: string;
    approved?: boolean;
  };
  audience?: string;
  contentRating?: string;
  moderationStatus?: HolofoilModerationStatus;
  provenance?: { source?: string; ingestedAt?: string };
  destinationUrl?: string;
  mimeType?: string;
};

export type HolofoilSurfaceRecord = {
  id: string;
  format: HolofoilSurfaceFormat;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  activationRadius?: number;
  audioRadius?: number;
  playlistId?: string;
  mediaIds?: string[];
  themeId?: string;
  interactionMode?: HolofoilInteractionMode;
};

export type HolofoilPlaylistRecord = {
  id: string;
  mediaIds: string[];
  rotateMs?: number;
};

export type HolofoilMediaTheme = {
  id: string;
  frameColor: string;
  frameMaterial: "matte" | "metal" | "emissive";
  emissiveColor: string;
  glowStrength: number;
  screenBrightness: number;
  borderWidth: number;
  supportColor: string;
  loadingColor: string;
  errorColor: string;
  focusColor: string;
  typeColor: string;
};

export type HolofoilPlaybackContext = {
  camera: [number, number, number];
  visibleSurfaceIds: string[];
  pageVisible: boolean;
  windowFocused: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  isMobile: boolean;
  frameMs: number;
  nowMs: number;
  audioAuthorized: boolean;
  globalMute: boolean;
  placementGroup?: string;
};

export type HolofoilGovernorConfig = {
  maxPlaying: number;
  maxPlayingMobile: number;
  maxDpr: number;
  pauseDistance: number;
  audioExclusive: boolean;
};

export type HolofoilTelemetryEvent =
  | "surface_viewed"
  | "media_started"
  | "media_completed"
  | "interaction_opened"
  | "interaction_closed"
  | "audio_enabled"
  | "playback_failed"
  | "fallback_displayed";

export type HolofoilTelemetryAdapter = {
  emit: (event: HolofoilTelemetryEvent, payload: Record<string, string | number | boolean>) => void;
};

export type HolofoilHlsAdapter = {
  attach: (video: HTMLVideoElement, source: string) => { detach: () => void };
};

export type RegistryWarning = {
  code: string;
  message: string;
  id?: string;
};

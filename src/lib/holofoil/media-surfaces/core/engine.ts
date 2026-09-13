import { createAudioController } from "./audio.ts";
import { selectPlayableSurfaces } from "../performance/governor.ts";
import {
  accessibilityGaps,
  rightsFailClosed,
  validateMediaRecord,
  validateSurfaceRecord,
} from "../schemas/validate.ts";
import { DEFAULT_MEDIA_THEME } from "../themes/default.ts";
import { createTelemetry } from "../telemetry/bus.ts";
import type {
  HolofoilGovernorConfig,
  HolofoilHlsAdapter,
  HolofoilMediaRecord,
  HolofoilMediaTheme,
  HolofoilPlaybackContext,
  HolofoilPlaylistRecord,
  HolofoilSurfaceRecord,
  HolofoilTelemetryAdapter,
  RegistryWarning,
} from "../schemas/types.ts";

export type ResolvedSurfaceMedia = {
  surface: HolofoilSurfaceRecord;
  media: HolofoilMediaRecord | null;
  fallback: "poster" | "neutral" | "none";
  warnings: RegistryWarning[];
  a11y: RegistryWarning[];
};

const defaultContext = (): HolofoilPlaybackContext => ({
  camera: [0, 2, 8],
  visibleSurfaceIds: [],
  pageVisible: true,
  windowFocused: true,
  reducedMotion: false,
  saveData: false,
  isMobile: false,
  frameMs: 16,
  nowMs: 0,
  audioAuthorized: false,
  globalMute: false,
});

export class HolofoilMediaSurfaceEngine {
  readonly media = new Map<string, HolofoilMediaRecord>();
  readonly surfaces = new Map<string, HolofoilSurfaceRecord>();
  readonly playlists = new Map<string, HolofoilPlaylistRecord>();
  readonly themes = new Map<string, HolofoilMediaTheme>([["theme-default", DEFAULT_MEDIA_THEME]]);
  warnings: RegistryWarning[] = [];
  context: HolofoilPlaybackContext = defaultContext();
  governor: HolofoilGovernorConfig = {
    maxPlaying: 3,
    maxPlayingMobile: 1,
    maxDpr: 1.5,
    pauseDistance: 18,
    audioExclusive: true,
  };
  readonly audio = createAudioController();
  hls?: HolofoilHlsAdapter;
  private telemetry = createTelemetry();
  private playable = new Set<string>();
  private audible: string | null = null;
  expandedSurfaceId: string | null = null;
  private listeners = new Set<() => void>();

  registerMedia(records: unknown[]): RegistryWarning[] {
    const batch: RegistryWarning[] = [];
    for (const record of records) {
      const checked = validateMediaRecord(record);
      batch.push(...checked.warnings);
      if (!checked.ok || !checked.value) continue;
      if (this.media.has(checked.value.id)) {
        batch.push({ code: "duplicate_id", message: `Duplicate media id ${checked.value.id}`, id: checked.value.id });
        continue;
      }
      this.media.set(checked.value.id, checked.value);
    }
    this.warnings.push(...batch);
    this.emit();
    return batch;
  }

  registerSurfaces(records: unknown[]): RegistryWarning[] {
    const batch: RegistryWarning[] = [];
    for (const record of records) {
      const checked = validateSurfaceRecord(record);
      batch.push(...checked.warnings);
      if (!checked.ok || !checked.value) continue;
      if (this.surfaces.has(checked.value.id)) {
        batch.push({ code: "duplicate_id", message: `Duplicate surface id ${checked.value.id}`, id: checked.value.id });
        continue;
      }
      this.surfaces.set(checked.value.id, checked.value);
    }
    this.warnings.push(...batch);
    this.emit();
    return batch;
  }

  registerPlaylist(playlist: HolofoilPlaylistRecord): void {
    this.playlists.set(playlist.id, playlist);
  }

  registerTheme(theme: HolofoilMediaTheme): void {
    this.themes.set(theme.id, theme);
  }

  registerAdapter(kind: "telemetry" | "hls", adapter: HolofoilTelemetryAdapter | HolofoilHlsAdapter): void {
    if (kind === "telemetry") this.telemetry = createTelemetry(adapter as HolofoilTelemetryAdapter);
    if (kind === "hls") this.hls = adapter as HolofoilHlsAdapter;
  }

  updateContext(partial: Partial<HolofoilPlaybackContext>): void {
    const prev = this.context;
    this.context = { ...this.context, ...partial };
    const audio = this.audio.get();
    this.context.audioAuthorized = audio.authorized;
    this.context.globalMute = audio.globalMute;
    if (this.context.windowFocused === false || this.context.pageVisible === false) {
      this.audio.onFocusLost();
    }
    const dx = this.context.camera[0] - prev.camera[0];
    const dy = this.context.camera[1] - prev.camera[1];
    const dz = this.context.camera[2] - prev.camera[2];
    const moved = dx * dx + dy * dy + dz * dz > 0.04;
    const flags =
      this.context.pageVisible !== prev.pageVisible ||
      this.context.windowFocused !== prev.windowFocused ||
      this.context.reducedMotion !== prev.reducedMotion ||
      this.context.isMobile !== prev.isMobile ||
      this.context.saveData !== prev.saveData ||
      this.context.audioAuthorized !== prev.audioAuthorized ||
      this.context.globalMute !== prev.globalMute;
    if (moved || flags || !this.playable.size) this.recompute();
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    for (const fn of this.listeners) fn();
  }

  private pickMedia(surface: HolofoilSurfaceRecord, nowMs: number): { media: HolofoilMediaRecord | null; reason?: RegistryWarning } {
    const playlist = surface.playlistId ? this.playlists.get(surface.playlistId) : undefined;
    let ids = playlist?.mediaIds ?? surface.mediaIds ?? [];
    if (playlist?.rotateMs && playlist.rotateMs > 0 && ids.length > 1) {
      const index = Math.floor(nowMs / playlist.rotateMs) % ids.length;
      ids = [ids[index], ...ids.filter((_, i) => i !== index)];
    }
    const ranked = ids
      .map((id) => this.media.get(id))
      .filter((item): item is HolofoilMediaRecord => Boolean(item))
      .filter((item) => {
        if (!this.context.placementGroup || !item.placementGroup) return true;
        return item.placementGroup === this.context.placementGroup;
      })
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    if (!ids.length) return { media: null, reason: { code: "missing_assignment", message: "Surface has no media ids.", id: surface.id } };
    if (!ranked.length) return { media: null, reason: { code: "missing_asset", message: "Assigned media was not registered.", id: surface.id } };
    for (const candidate of ranked) {
      const closed = rightsFailClosed(candidate, nowMs);
      if (closed) {
        this.telemetry.emit("fallback_displayed", { surfaceId: surface.id, reason: closed.code });
        continue;
      }
      return { media: candidate };
    }
    return { media: null, reason: { code: "fail_closed", message: "No eligible media for this surface.", id: surface.id } };
  }

  resolve(surfaceId: string): ResolvedSurfaceMedia {
    const surface = this.surfaces.get(surfaceId);
    if (!surface) {
      return {
        surface: { id: surfaceId, format: "custom" },
        media: null,
        fallback: "neutral",
        warnings: [{ code: "unknown_surface", message: `Surface ${surfaceId} is not registered.` }],
        a11y: [],
      };
    }
    const picked = this.pickMedia(surface, Number.isFinite(this.context.nowMs) ? this.context.nowMs : Date.now());
    if (!picked.media) {
      return {
        surface,
        media: null,
        fallback: "neutral",
        warnings: picked.reason ? [picked.reason] : [],
        a11y: [],
      };
    }
    return {
      surface,
      media: picked.media,
      fallback: "none",
      warnings: [],
      a11y: accessibilityGaps(picked.media),
    };
  }

  recompute(): { play: Set<string>; audible: string | null } {
    const priorities: Record<string, number> = {};
    const list = [...this.surfaces.values()];
    for (const surface of list) {
      const resolved = this.resolve(surface.id);
      priorities[surface.id] = resolved.media?.priority ?? 0;
    }
    const result = selectPlayableSurfaces({
      surfaces: list,
      priorities,
      context: this.context,
      config: this.governor,
    });
    this.playable = result.play;
    this.audible = result.audible;
    this.audio.setAudible(result.audible);
    this.emit();
    return result;
  }

  canPlay(surfaceId: string): boolean {
    return this.playable.has(surfaceId);
  }

  canHear(surfaceId: string): boolean {
    return this.audible === surfaceId;
  }

  themeFor(surface: HolofoilSurfaceRecord): HolofoilMediaTheme {
    return this.themes.get(surface.themeId ?? "theme-default") ?? DEFAULT_MEDIA_THEME;
  }

  report(event: Parameters<ReturnType<typeof createTelemetry>["emit"]>[0], payload: Record<string, string | number | boolean>) {
    this.telemetry.emit(event, payload);
  }

  openCinema(surfaceId: string): void {
    this.audio.authorize();
    this.audio.setGlobalMute(false);
    this.expandedSurfaceId = surfaceId;
    this.report("interaction_opened", { surfaceId });
    this.report("audio_enabled", { surfaceId });
    this.emit();
  }

  closeCinema(): void {
    if (this.expandedSurfaceId) {
      this.report("interaction_closed", { surfaceId: this.expandedSurfaceId });
    }
    this.expandedSurfaceId = null;
    this.emit();
  }

  dispose(): void {
    this.media.clear();
    this.surfaces.clear();
    this.playlists.clear();
    this.playable.clear();
    this.audible = null;
    this.expandedSurfaceId = null;
    this.audio.reset();
    this.listeners.clear();
    this.warnings = [];
    this.context = defaultContext();
  }
}

let singleton: HolofoilMediaSurfaceEngine | null = null;

export function getHolofoilMediaEngine(): HolofoilMediaSurfaceEngine {
  singleton ??= new HolofoilMediaSurfaceEngine();
  return singleton;
}

export function registerHolofoilMedia(records: unknown[]) {
  return getHolofoilMediaEngine().registerMedia(records);
}
export function registerHolofoilSurfaces(records: unknown[]) {
  return getHolofoilMediaEngine().registerSurfaces(records);
}
export function registerHolofoilPlaylists(playlists: HolofoilPlaylistRecord[]) {
  const engine = getHolofoilMediaEngine();
  for (const playlist of playlists) engine.registerPlaylist(playlist);
}
export function registerHolofoilTheme(theme: HolofoilMediaTheme) {
  getHolofoilMediaEngine().registerTheme(theme);
}
export function registerHolofoilAdapter(kind: "telemetry" | "hls", adapter: HolofoilTelemetryAdapter | HolofoilHlsAdapter) {
  getHolofoilMediaEngine().registerAdapter(kind, adapter);
}
export function mountHolofoilSurface(surfaceId: string) {
  return getHolofoilMediaEngine().resolve(surfaceId);
}
export function updateHolofoilContext(partial: Partial<HolofoilPlaybackContext>) {
  getHolofoilMediaEngine().updateContext(partial);
}
export function disposeHolofoil() {
  getHolofoilMediaEngine().dispose();
  singleton = null;
}

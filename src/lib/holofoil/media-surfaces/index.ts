export {
  HolofoilMediaSurfaceEngine,
  disposeHolofoil,
  getHolofoilMediaEngine,
  mountHolofoilSurface,
  registerHolofoilAdapter,
  registerHolofoilMedia,
  registerHolofoilPlaylists,
  registerHolofoilSurfaces,
  registerHolofoilTheme,
  updateHolofoilContext,
} from "./core/engine.ts";
export { DEFAULT_MEDIA_THEME } from "./themes/default.ts";
export { DEFAULT_GOVERNOR, selectPlayableSurfaces } from "./performance/governor.ts";
export { ingestMediaFiles } from "./loaders/ingest.ts";
export { HolofoilDomSurface } from "./adapters/dom.tsx";
export { createAudioController, audioAttenuation } from "./core/audio.ts";
export { commandFromKey, commandFromFilename, commandFromPointer } from "./interactions/dispatch.ts";
export { reportAccessibility, releaseBlocked } from "./accessibility/report.ts";
export { FallbackSurface } from "./components/FallbackSurface.tsx";
export { CinemaOverlay } from "./components/CinemaOverlay.tsx";
export { HolofoilCinemaHost } from "./components/CinemaHost.tsx";
export { AudioStatus } from "./components/AudioStatus.tsx";
export type {
  HolofoilMediaRecord,
  HolofoilMediaTheme,
  HolofoilPlaybackContext,
  HolofoilPlaylistRecord,
  HolofoilSurfaceRecord,
} from "./schemas/types.ts";

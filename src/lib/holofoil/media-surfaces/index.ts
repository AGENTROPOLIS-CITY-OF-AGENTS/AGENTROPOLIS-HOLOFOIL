/**
 * Holofoil Media-Surface Engine
 *
 * Shared infrastructure for turning registered video/image assets into
 * interactive, performance-aware surfaces. Consuming apps supply media,
 * placements, themes, and optional adapters. The core stays evergreen.
 *
 * Public API:
 *   registerHolofoilMedia
 *   registerHolofoilSurfaces
 *   registerHolofoilTheme
 *   registerHolofoilAdapter
 *   mountHolofoilSurface
 *   updateHolofoilContext
 *   disposeHolofoil
 *   getHolofoilMediaEngine
 */
export {
  HolofoilMediaSurfaceEngine,
  disposeHolofoil,
  getHolofoilMediaEngine,
  mountHolofoilSurface,
  registerHolofoilAdapter,
  registerHolofoilMedia,
  registerHolofoilSurfaces,
  registerHolofoilTheme,
  updateHolofoilContext,
} from "./core/engine.ts";
export { DEFAULT_MEDIA_THEME } from "./themes/default.ts";
export { DEFAULT_GOVERNOR, selectPlayableSurfaces } from "./performance/governor.ts";
export { ingestMediaFiles } from "./loaders/ingest.ts";
export { HolofoilDomSurface } from "./adapters/dom.tsx";
export { createAudioController } from "./core/audio.ts";
export type {
  HolofoilMediaRecord,
  HolofoilMediaTheme,
  HolofoilPlaybackContext,
  HolofoilSurfaceRecord,
} from "./schemas/types.ts";

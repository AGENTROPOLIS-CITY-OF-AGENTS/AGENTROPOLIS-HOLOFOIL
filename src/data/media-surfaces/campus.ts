import type { HolofoilMediaRecord, HolofoilSurfaceRecord } from "@/lib/holofoil/media-surfaces";
import type { HolofoilMediaSurfaceEngine } from "@/lib/holofoil/media-surfaces/core/engine";

/** This application’s campus consumer. Not part of the Holofoil core. */
export const CAMPUS_MEDIA: HolofoilMediaRecord[] = [
  {
    id: "media-001",
    source: "/campus-hero.mp4",
    mediaType: "video",
    poster: "/campus-hero.jpg",
    title: "Campus flythrough",
    description: "Authorized Holofoil campus presentation surface.",
    altText: "Aerial flythrough of the Holofoil campus",
    captions: "/campus-hero.vtt",
    aspectRatio: 16 / 10,
    loop: true,
    mutedByDefault: true,
    audioEligible: true,
    priority: 10,
    tags: ["campus", "presentation"],
    placementGroup: "campus",
    rights: {
      owner: "Holofoil",
      license: "internal-presentation",
      sourceUrl: "/campus-hero.mp4",
      approved: true,
    },
    audience: "public",
    contentRating: "general",
    moderationStatus: "approved",
    provenance: { source: "public/campus-hero.mp4" },
  },
];

export const CAMPUS_SURFACES: HolofoilSurfaceRecord[] = [
  {
    id: "surface-001",
    format: "landscape",
    mediaIds: ["media-001"],
    themeId: "theme-default",
    interactionMode: "expand",
  },
  {
    id: "surface-002",
    format: "rooftop",
    position: [0, 7.4, 1.4],
    rotation: [0, 0, 0],
    scale: [3.2, 1.8, 1],
    activationRadius: 22,
    audioRadius: 8,
    mediaIds: ["media-001"],
    themeId: "theme-default",
    interactionMode: "expand",
  },
  {
    id: "surface-003",
    format: "wall",
    position: [-7.2, 2.1, -1.05],
    rotation: [0, 0, 0],
    scale: [2.2, 1.24, 1],
    activationRadius: 16,
    mediaIds: ["media-001"],
    themeId: "theme-default",
    interactionMode: "expand",
  },
];

export function ensureCampusMediaSurfaces(engine: HolofoilMediaSurfaceEngine): void {
  if (!engine.media.has("media-001")) engine.registerMedia(CAMPUS_MEDIA);
  if (!engine.surfaces.has("surface-001")) engine.registerSurfaces(CAMPUS_SURFACES);
}

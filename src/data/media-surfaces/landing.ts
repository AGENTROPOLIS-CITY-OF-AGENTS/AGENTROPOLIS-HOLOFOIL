import type { NavPath } from "@/lib/holofoil/nav";
import type { HolofoilMediaRecord, HolofoilSurfaceRecord } from "@/lib/holofoil/media-surfaces";
import type { HolofoilMediaSurfaceEngine } from "@/lib/holofoil/media-surfaces/core/engine";

export type LandingChapter = {
  surfaceId: string;
  kicker: string;
  title: string;
  neuro: string;
  href?: NavPath;
};

const rights = {
  owner: "Holofoil",
  license: "internal-presentation",
  approved: true as const,
};

function clip(
  id: string,
  file: string,
  title: string,
  alt: string,
): HolofoilMediaRecord {
  return {
    id,
    source: `/media/neuro/${file}.mp4`,
    mediaType: "video",
    poster: `/media/neuro/${file}.jpg`,
    title,
    altText: alt,
    captions: `/media/neuro/${file}.vtt`,
    aspectRatio: 16 / 9,
    loop: true,
    mutedByDefault: true,
    audioEligible: true,
    priority: 8,
    tags: ["landing", "neuro"],
    placementGroup: "landing",
    rights: { ...rights, sourceUrl: `/media/neuro/${file}.mp4` },
    audience: "public",
    contentRating: "general",
    moderationStatus: "approved",
    provenance: { source: `public/media/neuro/${file}.mp4` },
  };
}

export const LANDING_MEDIA: HolofoilMediaRecord[] = [
  clip("media-hero", "hero", "Holofoil title sequence", "Holographic Holofoil mark rotating over an obsidian city"),
  clip("media-neuro", "neuro", "NEURO concierge", "Hooded holographic concierge in a control room"),
  clip("media-belong", "belong", "Belong", "Agentropolis member in bomber jacket smiling"),
  clip("media-build", "build", "Build", "Agentropolis builder seated in branded gear"),
  clip("media-create", "create", "Create", "Agentropolis creator in a holographic hoodie"),
  clip("media-automate", "automate", "Automate", "Agentropolis operator in a neon studio"),
  clip("media-steward", "steward", "Steward", "Agentropolis steward at a marble desk"),
  clip("media-lab", "lab", "Material Lab", "Hands tilting a holographic foil card"),
  clip("media-cloud", "create-cloud", "Creator Cloud", "Collectible layers assembling in a dark studio"),
  {
    id: "media-campus",
    source: "/campus-hero.mp4",
    mediaType: "video",
    poster: "/campus-hero.jpg",
    title: "Campus",
    altText: "Holofoil campus flythrough",
    aspectRatio: 16 / 10,
    loop: true,
    mutedByDefault: true,
    audioEligible: true,
    priority: 7,
    tags: ["landing", "campus"],
    placementGroup: "landing",
    rights: { ...rights, sourceUrl: "/campus-hero.mp4" },
    audience: "public",
    contentRating: "general",
    moderationStatus: "approved",
    provenance: { source: "public/campus-hero.mp4" },
  },
];

export const LANDING_SURFACES: HolofoilSurfaceRecord[] = LANDING_MEDIA.map((media) => ({
  id: `surface-${media.id.replace("media-", "")}`,
  format: "cinema",
  mediaIds: [media.id],
  themeId: "theme-default",
  interactionMode: "expand",
}));

export const LANDING_CHAPTERS: LandingChapter[] = [
  {
    surfaceId: "surface-belong",
    kicker: "01 · Belong",
    title: "People first",
    neuro: "NEURO: Holofoil is a city of people who build with agents — not a mint booth.",
  },
  {
    surfaceId: "surface-build",
    kicker: "02 · Build",
    title: "Make the drop",
    neuro: "NEURO: Start with what you have. I route the work. You approve the decisions.",
    href: "/intake",
  },
  {
    surfaceId: "surface-create",
    kicker: "03 · Create",
    title: "Creator Cloud",
    neuro: "NEURO: Mix layers, compile DNA, package a collection. Web2 simple. Web3 optional.",
    href: "/builder",
  },
  {
    surfaceId: "surface-automate",
    kicker: "04 · Automate",
    title: "Agents on duty",
    neuro: "NEURO: Specialists simulate, reconstruct, and stage. I stay the concierge.",
    href: "/services",
  },
  {
    surfaceId: "surface-steward",
    kicker: "05 · Steward",
    title: "A better tomorrow",
    neuro: "NEURO: Governance, receipts, and launch readiness stay visible. Nothing silent.",
    href: "/project",
  },
];

export const LANDING_SECTIONS: LandingChapter[] = [
  {
    surfaceId: "surface-lab",
    kicker: "Material Lab",
    title: "Foil you can prove",
    neuro: "NEURO: Deterministic materials. Same seed, same shine.",
    href: "/lab",
  },
  {
    surfaceId: "surface-cloud",
    kicker: "Creator Cloud",
    title: "Create → Mix → Publish",
    neuro: "NEURO: Build the drop like a website. Publish it like a product.",
    href: "/builder",
  },
  {
    surfaceId: "surface-campus",
    kicker: "Campus",
    title: "Enter the 3D city",
    neuro: "NEURO: The campus is live. Click a film. Then walk the district.",
    href: "/campus",
  },
];

export function ensureLandingMedia(engine: HolofoilMediaSurfaceEngine): void {
  if (!engine.media.has("media-hero")) engine.registerMedia(LANDING_MEDIA);
  if (!engine.surfaces.has("surface-hero")) engine.registerSurfaces(LANDING_SURFACES);
}

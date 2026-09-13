import type {
  HolofoilGovernorConfig,
  HolofoilPlaybackContext,
  HolofoilSurfaceRecord,
} from "../schemas/types.ts";

export const DEFAULT_GOVERNOR: HolofoilGovernorConfig = {
  maxPlaying: 3,
  maxPlayingMobile: 1,
  maxDpr: 1.5,
  pauseDistance: 18,
  audioExclusive: true,
};

function distance(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function selectPlayableSurfaces(input: {
  surfaces: HolofoilSurfaceRecord[];
  priorities: Record<string, number>;
  context: HolofoilPlaybackContext;
  config?: Partial<HolofoilGovernorConfig>;
}): { play: Set<string>; audible: string | null } {
  const config = { ...DEFAULT_GOVERNOR, ...input.config };
  const play = new Set<string>();
  if (!input.context.pageVisible || input.context.reducedMotion) {
    return { play, audible: null };
  }
  const budget = input.context.isMobile || input.context.saveData ? config.maxPlayingMobile : config.maxPlaying;
  const ranked = input.surfaces
    .filter((surface) => input.context.visibleSurfaceIds.includes(surface.id) || input.context.visibleSurfaceIds.length === 0)
    .map((surface) => {
      const pos = surface.position ?? [0, 0, 0];
      const dist = distance(input.context.camera, pos);
      const limit = surface.activationRadius ?? config.pauseDistance;
      return {
        surface,
        dist,
        inRange: dist <= limit,
        priority: input.priorities[surface.id] ?? 0,
      };
    })
    .filter((row) => row.inRange)
    .sort((a, b) => b.priority - a.priority || a.dist - b.dist);

  for (const row of ranked) {
    if (play.size >= budget) break;
    if (input.context.frameMs > 32 && play.size >= 1) break;
    play.add(row.surface.id);
  }

  const audible = config.audioExclusive
    ? ranked.find((row) => play.has(row.surface.id) && input.context.audioAuthorized && !input.context.globalMute)?.surface.id ?? null
    : null;
  return { play, audible };
}

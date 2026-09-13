const STORAGE_KEY = "holofoil.media-surfaces.audio";

export type AudioState = {
  authorized: boolean;
  globalMute: boolean;
  audibleSurfaceId: string | null;
};

export function readStoredAudio(): Pick<AudioState, "globalMute"> {
  if (typeof window === "undefined") return { globalMute: false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { globalMute: false };
    const parsed = JSON.parse(raw) as { globalMute?: boolean };
    return { globalMute: parsed.globalMute === true };
  } catch {
    return { globalMute: false };
  }
}

export function writeStoredAudio(state: Pick<AudioState, "globalMute">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export function audioAttenuation(distance: number, radius: number): number {
  if (radius <= 0) return 0;
  if (distance >= radius) return 0;
  return Math.max(0, 1 - distance / radius);
}

export function createAudioController() {
  const stored = readStoredAudio();
  let state: AudioState = { authorized: false, globalMute: stored.globalMute, audibleSurfaceId: null };
  return {
    get: () => state,
    authorize: () => {
      state = { ...state, authorized: true };
    },
    setGlobalMute: (mute: boolean) => {
      state = { ...state, globalMute: mute, audibleSurfaceId: mute ? null : state.audibleSurfaceId };
      writeStoredAudio({ globalMute: mute });
    },
    setAudible: (surfaceId: string | null) => {
      if (!state.authorized || state.globalMute) {
        state = { ...state, audibleSurfaceId: null };
        return;
      }
      state = { ...state, audibleSurfaceId: surfaceId };
    },
    onFocusLost: () => {
      state = { ...state, audibleSurfaceId: null };
    },
    reset: () => {
      state = { authorized: false, globalMute: false, audibleSurfaceId: null };
    },
  };
}

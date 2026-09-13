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

export function createAudioController(): {
  get: () => AudioState;
  authorize: () => void;
  setGlobalMute: (mute: boolean) => void;
  setAudible: (surfaceId: string | null) => void;
  reset: () => void;
} {
  const stored = readStoredAudio();
  let state: AudioState = { authorized: false, globalMute: stored.globalMute, audibleSurfaceId: null };
  return {
    get: () => state,
    authorize: () => {
      state = { ...state, authorized: true };
    },
    setGlobalMute: (mute) => {
      state = { ...state, globalMute: mute, audibleSurfaceId: mute ? null : state.audibleSurfaceId };
      writeStoredAudio({ globalMute: mute });
    },
    setAudible: (surfaceId) => {
      if (!state.authorized || state.globalMute) {
        state = { ...state, audibleSurfaceId: null };
        return;
      }
      state = { ...state, audibleSurfaceId: surfaceId };
    },
    reset: () => {
      state = { authorized: false, globalMute: false, audibleSurfaceId: null };
    },
  };
}

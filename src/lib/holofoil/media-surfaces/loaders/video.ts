import type { HolofoilMediaRecord } from "../schemas/types.ts";

export type ManagedVideo = {
  el: HTMLVideoElement;
  play: () => Promise<"playing" | "rejected" | "poster">;
  pause: () => void;
  setMuted: (muted: boolean) => void;
  dispose: () => void;
};

export function inferMime(source: string, explicit?: string): string | undefined {
  if (explicit) return explicit;
  const lower = source.toLowerCase();
  if (lower.includes(".webm")) return "video/webm";
  if (lower.includes(".m3u8")) return "application/vnd.apple.mpegurl";
  if (lower.includes(".mp4") || lower.includes(".m4v")) return "video/mp4";
  return undefined;
}

export function createManagedVideo(
  media: HolofoilMediaRecord,
  hlsAttach?: (video: HTMLVideoElement, source: string) => { detach: () => void },
): ManagedVideo | null {
  if (typeof document === "undefined") return null;
  const el = document.createElement("video");
  el.playsInline = true;
  el.muted = media.mutedByDefault !== false;
  el.loop = media.loop !== false;
  el.preload = "metadata";
  el.setAttribute("playsinline", "true");
  if (media.poster) el.poster = media.poster;
  if (media.altText) el.setAttribute("aria-label", media.altText);
  let detached: { detach: () => void } | null = null;
  const mime = inferMime(media.source, media.mimeType);
  if (mime === "application/vnd.apple.mpegurl" && hlsAttach) {
    detached = hlsAttach(el, media.source);
  } else {
    el.src = media.source;
  }

  return {
    el,
    play: async () => {
      try {
        await el.play();
        return "playing";
      } catch {
        return "rejected";
      }
    },
    pause: () => {
      el.pause();
    },
    setMuted: (muted) => {
      el.muted = muted;
    },
    dispose: () => {
      el.pause();
      el.removeAttribute("src");
      el.load();
      detached?.detach();
    },
  };
}

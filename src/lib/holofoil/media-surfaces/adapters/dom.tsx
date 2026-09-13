import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/holofoil/motion";
import type { HolofoilMediaSurfaceEngine } from "../core/engine.ts";
import { createManagedVideo } from "../loaders/video.ts";

export function HolofoilDomSurface({
  surfaceId,
  engine,
  className,
}: {
  surfaceId: string;
  engine: HolofoilMediaSurfaceEngine;
  className?: string;
}) {
  const resolved = engine.resolve(surfaceId);
  const theme = engine.themeFor(resolved.surface);
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<ReturnType<typeof createManagedVideo>>(null);
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState(false);
  const media = resolved.media;
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && document.visibilityState === "visible";
        engine.updateContext({
          pageVisible: document.visibilityState === "visible",
          reducedMotion: prefersReducedMotion(),
          visibleSurfaceIds: visible ? [surfaceId] : [],
          nowMs: Date.now(),
        });
      },
      { threshold: 0.15 },
    );
    io.observe(host);
    const onVis = () => {
      if (document.visibilityState !== "visible") {
        engine.updateContext({ pageVisible: false });
        videoRef.current?.pause();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [engine, surfaceId]);

  useEffect(() => {
    if (!media || media.mediaType === "image" || reduced) return;
    const managed = createManagedVideo(media, engine.hls?.attach);
    videoRef.current = managed;
    if (!managed) return;
    if (hostRef.current) hostRef.current.appendChild(managed.el);
    managed.el.className = "h-full w-full object-contain";
    managed.el.style.background = theme.supportColor;
    const start = async () => {
      if (!engine.canPlay(surfaceId)) {
        managed.pause();
        return;
      }
      managed.setMuted(!engine.canHear(surfaceId));
      const result = await managed.play();
      if (result === "rejected") {
        setFailed(true);
        engine.report("playback_failed", { surfaceId });
        engine.report("fallback_displayed", { surfaceId });
      } else {
        engine.report("media_started", { surfaceId });
      }
    };
    void start();
    return () => {
      managed.dispose();
      videoRef.current = null;
    };
  }, [engine, media, reduced, surfaceId, theme.supportColor]);

  const poster = media?.poster;
  const showFallback = !media || failed || reduced || resolved.fallback !== "none";
  const label = media?.altText ?? media?.title ?? "Media surface";

  return (
    <div
      ref={hostRef}
      className={className}
      tabIndex={0}
      role="group"
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (resolved.surface.interactionMode === "expand") setExpanded(true);
          engine.audio.authorize();
          engine.report("audio_enabled", { surfaceId });
        }
        if (event.key === "Escape") setExpanded(false);
        if (event.key === "m" || event.key === "M") engine.audio.setGlobalMute(!engine.audio.get().globalMute);
      }}
      onClick={() => {
        engine.audio.authorize();
      }}
      style={{
        outlineColor: theme.focusColor,
        background: theme.supportColor,
        border: `${Math.max(1, theme.borderWidth * 16)}px solid ${theme.frameColor}`,
      }}
    >
      {showFallback ? (
        poster ? (
          <img src={poster} alt={label} className="block h-auto w-full" />
        ) : (
          <div className="grid min-h-40 place-items-center text-sm" style={{ color: theme.typeColor, background: theme.errorColor }}>
            Surface unavailable
          </div>
        )
      ) : null}
      {expanded ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <button
            type="button"
            className="absolute top-4 right-4 min-h-11 rounded-full px-4"
            style={{ background: theme.focusColor, color: theme.supportColor }}
            onClick={() => {
              setExpanded(false);
              engine.report("interaction_closed", { surfaceId });
            }}
          >
            Close
          </button>
          {poster ? <img src={poster} alt={label} className="max-h-full max-w-full" /> : null}
        </div>
      ) : null}
    </div>
  );
}

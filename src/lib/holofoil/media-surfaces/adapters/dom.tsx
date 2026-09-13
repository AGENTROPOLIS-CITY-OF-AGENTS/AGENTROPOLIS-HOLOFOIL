import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/holofoil/motion";
import type { HolofoilMediaSurfaceEngine } from "../core/engine.ts";
import { createManagedVideo } from "../loaders/video.ts";
import { commandFromKey, commandFromPointer } from "../interactions/dispatch.ts";
import { FallbackSurface } from "../components/FallbackSurface.tsx";
import { AudioStatus } from "../components/AudioStatus.tsx";

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
          windowFocused: document.hasFocus(),
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
    const onBlur = () => {
      engine.updateContext({ windowFocused: false });
      engine.audio.onFocusLost();
      videoRef.current?.setMuted(true);
    };
    const onFocus = () => engine.updateContext({ windowFocused: true });
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
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
  const audio = engine.audio.get();

  const openCinema = () => {
    if (!media) return;
    engine.openCinema(surfaceId);
    void videoRef.current?.play();
  };

  return (
    <div
      ref={hostRef}
      className={["relative cursor-pointer", className].filter(Boolean).join(" ")}
      tabIndex={0}
      role="button"
      aria-label={`Open and play ${label}`}
      onKeyDown={(event) => {
        const command = commandFromKey(event.key, resolved.surface.interactionMode, media?.destinationUrl);
        if (command.type === "none") return;
        event.preventDefault();
        if (command.type === "expand" || command.type === "authorize_audio") openCinema();
        if (command.type === "close") engine.closeCinema();
        if (command.type === "toggle_mute") engine.audio.setGlobalMute(!engine.audio.get().globalMute);
        if (command.type === "open_destination" && command.url.startsWith("https://")) {
          window.open(command.url, "_blank", "noopener,noreferrer");
        }
      }}
      onClick={() => {
        const command = commandFromPointer(resolved.surface.interactionMode, media?.destinationUrl);
        if (command.type === "open_destination" && command.url.startsWith("https://")) {
          window.open(command.url, "_blank", "noopener,noreferrer");
          return;
        }
        if (command.type !== "none") openCinema();
      }}
      style={{
        outlineColor: theme.focusColor,
        background: theme.supportColor,
        border: `${Math.max(1, theme.borderWidth * 16)}px solid ${theme.frameColor}`,
      }}
    >
      {showFallback ? <FallbackSurface theme={theme} poster={poster} label={label} /> : null}
      <div className="pointer-events-none absolute bottom-2 left-2">
        <AudioStatus muted={audio.globalMute || !engine.canHear(surfaceId)} authorized={audio.authorized} />
      </div>
    </div>
  );
}

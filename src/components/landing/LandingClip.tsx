import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/holofoil/motion";
import type { HolofoilMediaSurfaceEngine } from "@/lib/holofoil/media-surfaces/core/engine";

export function LandingClip({
  surfaceId,
  engine,
  className,
  children,
}: {
  surfaceId: string;
  engine: HolofoilMediaSurfaceEngine;
  className?: string;
  children?: ReactNode;
}) {
  const resolved = engine.resolve(surfaceId);
  const media = resolved.media;
  const hostRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const video = videoRef.current;
    if (!host || !video || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && document.visibilityState === "visible") {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(host);
    const onVis = () => {
      if (document.visibilityState !== "visible") video.pause();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      video.pause();
    };
  }, [reduced, surfaceId]);

  if (!media) return null;
  const label = media.altText ?? media.title ?? "Open film";

  return (
    <button
      ref={hostRef}
      type="button"
      className={["relative block overflow-hidden bg-bg-subtle text-left", className].filter(Boolean).join(" ")}
      aria-label={`Open and play ${label}`}
      onClick={() => engine.openCinema(surfaceId)}
    >
      {reduced ? (
        <img src={media.poster} alt={label} className="h-full w-full object-cover" />
      ) : (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          poster={media.poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        >
          <source src={media.source} type="video/mp4" />
        </video>
      )}
      {children}
    </button>
  );
}

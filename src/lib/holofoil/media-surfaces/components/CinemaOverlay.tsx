import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { HolofoilMediaTheme } from "../schemas/types.ts";

export function CinemaOverlay({
  theme,
  src,
  poster,
  label,
  loop = true,
  onClose,
}: {
  theme: HolofoilMediaTheme;
  src?: string;
  poster?: string;
  label: string;
  loop?: boolean;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    const play = () => {
      void el.play().catch(() => {
        el.muted = true;
        void el.play().catch(() => {});
      });
    };
    play();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      el.pause();
    };
  }, [onClose, src]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/85 p-3 sm:p-6"
      role="dialog"
      aria-label={label}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 z-[81] min-h-11 rounded-full px-4 text-sm font-medium"
        style={{ background: theme.focusColor, color: theme.supportColor }}
        onClick={onClose}
      >
        Close
      </button>
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-2xl border"
        style={{ borderColor: theme.frameColor, background: theme.supportColor }}
        onClick={(event) => event.stopPropagation()}
      >
        {src ? (
          <video
            ref={videoRef}
            className="block h-auto max-h-[80svh] w-full bg-black"
            src={src}
            poster={poster}
            controls
            playsInline
            autoPlay
            loop={loop}
            preload="auto"
            aria-label={label}
          />
        ) : poster ? (
          <img src={poster} alt={label} className="block max-h-[80svh] w-full object-contain" />
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

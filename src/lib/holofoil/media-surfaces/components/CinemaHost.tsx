import { useCallback, useSyncExternalStore } from "react";
import type { HolofoilMediaSurfaceEngine } from "../core/engine.ts";
import { CinemaOverlay } from "./CinemaOverlay.tsx";

/** DOM-only host. Never mount this inside a Canvas. */
export function HolofoilCinemaHost({ engine }: { engine: HolofoilMediaSurfaceEngine }) {
  const subscribe = useCallback((fn: () => void) => engine.subscribe(fn), [engine]);
  const expandedId = useSyncExternalStore(
    subscribe,
    () => engine.expandedSurfaceId,
    () => null,
  );
  if (!expandedId) return null;
  const resolved = engine.resolve(expandedId);
  const media = resolved.media;
  const theme = engine.themeFor(resolved.surface);
  const label = media?.altText ?? media?.title ?? "Media surface";
  return (
    <CinemaOverlay
      theme={theme}
      src={media?.source}
      poster={media?.poster}
      label={label}
      loop={media?.loop !== false}
      onClose={() => engine.closeCinema()}
    />
  );
}

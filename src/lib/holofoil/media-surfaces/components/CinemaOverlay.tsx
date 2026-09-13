import type { HolofoilMediaTheme } from "../schemas/types.ts";

export function CinemaOverlay({
  theme,
  poster,
  label,
  onClose,
}: {
  theme: HolofoilMediaTheme;
  poster?: string;
  label: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
      <button
        type="button"
        className="absolute top-4 right-4 min-h-11 rounded-full px-4"
        style={{ background: theme.focusColor, color: theme.supportColor }}
        onClick={onClose}
      >
        Close
      </button>
      {poster ? <img src={poster} alt={label} className="max-h-full max-w-full" /> : null}
    </div>
  );
}

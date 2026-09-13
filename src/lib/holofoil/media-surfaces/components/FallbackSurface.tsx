import type { HolofoilMediaTheme } from "../schemas/types.ts";

export function FallbackSurface({
  theme,
  poster,
  label,
}: {
  theme: HolofoilMediaTheme;
  poster?: string;
  label: string;
}) {
  if (poster) {
    return <img src={poster} alt={label} className="block h-auto w-full object-contain" />;
  }
  return (
    <div
      className="grid min-h-40 place-items-center text-sm"
      style={{ color: theme.typeColor, background: theme.errorColor }}
    >
      Surface unavailable
    </div>
  );
}

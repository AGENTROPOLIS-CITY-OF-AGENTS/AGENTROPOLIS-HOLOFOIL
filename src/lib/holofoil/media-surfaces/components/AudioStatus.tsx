export function AudioStatus({ muted, authorized }: { muted: boolean; authorized: boolean }) {
  const label = !authorized ? "Audio locked" : muted ? "Muted" : "Audio on";
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted" aria-live="polite">
      {label}
    </span>
  );
}

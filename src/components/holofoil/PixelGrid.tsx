export function PixelGrid({
  frame,
  className = "",
}: {
  frame?: string[][];
  className?: string;
}) {
  if (!frame || frame.length === 0) {
    return (
      <div className={`flex items-center justify-center text-xs text-muted ${className}`}>
        No frame
      </div>
    );
  }
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${frame[0].length}, 1fr)`,
        imageRendering: "pixelated",
      }}
      aria-hidden
    >
      {frame.flatMap((row, r) =>
        row.map((color, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              backgroundColor: color || "transparent",
              aspectRatio: "1",
            }}
          />
        )),
      )}
    </div>
  );
}

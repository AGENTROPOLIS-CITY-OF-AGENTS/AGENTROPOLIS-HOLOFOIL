import { useState } from "react";
import { Eraser, FlipHorizontal2, Pencil, Trash2 } from "lucide-react";

interface PixelEditorProps {
  grid: string[][];
  palette: string[];
  pixelSize: number;
  onChange: (next: string[][]) => void;
  onUpdateColor?: (index: number, color: string) => void;
}

export function PixelEditor({
  grid,
  palette,
  pixelSize,
  onChange,
  onUpdateColor,
}: PixelEditorProps) {
  const [selected, setSelected] = useState(palette[0] || "#ffffff");
  const [symmetric, setSymmetric] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");

  const paint = (row: number, col: number) => {
    const next = grid.map((r) => [...r]);
    const value = tool === "pencil" ? selected : "";
    next[row][col] = value;
    if (symmetric) {
      const mirror = pixelSize - 1 - col;
      if (mirror >= 0 && mirror < pixelSize) next[row][mirror] = value;
    }
    onChange(next);
  };

  return (
    <div
      className="flex h-full flex-col rounded-[18px] border border-border bg-bg-elevated p-4"
      onMouseLeave={() => setDrawing(false)}
      onMouseUp={() => setDrawing(false)}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="font-display text-base">Pixel Editor</h3>
          <p className="text-xs text-muted">Draw on the grid. Symmetry keeps forms balanced.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-md border px-3 text-xs ${
              tool === "pencil"
                ? "border-cyan text-cyan"
                : "border-border text-muted"
            }`}
            onClick={() => setTool(tool === "pencil" ? "eraser" : "pencil")}
          >
            {tool === "pencil" ? <Pencil className="size-3.5" /> : <Eraser className="size-3.5" />}
            {tool === "pencil" ? "Pencil" : "Eraser"}
          </button>
          <button
            type="button"
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-md border px-3 text-xs ${
              symmetric ? "border-cyan text-cyan" : "border-border text-muted"
            }`}
            onClick={() => setSymmetric((v) => !v)}
          >
            <FlipHorizontal2 className="size-3.5" />
            Symmetry {symmetric ? "on" : "off"}
          </button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-[12px] bg-bg p-4">
        <div
          className="w-full max-w-[280px] overflow-hidden rounded-md border border-border-strong"
          style={{
            display: "grid",
            gridTemplateRows: `repeat(${pixelSize}, 1fr)`,
            aspectRatio: "1",
          }}
        >
          {grid.map((row, r) => (
            <div key={r} className="flex">
              {row.map((color, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  aria-label={`Pixel ${r + 1}, ${c + 1}`}
                  className="relative flex-1 aspect-square border-0 p-0"
                  style={{ backgroundColor: color || "transparent" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDrawing(true);
                    paint(r, c);
                  }}
                  onMouseEnter={() => {
                    if (drawing) paint(r, c);
                  }}
                >
                  {!color ? (
                    <span
                      className={`absolute inset-0 ${
                        (r + c) % 2 === 0 ? "bg-bg-subtle/40" : "bg-bg/40"
                      }`}
                    />
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-3">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Palette
          </p>
          <div className="flex items-center gap-1.5">
            {palette.map((color, i) => (
              <button
                key={`${color}-${i}`}
                type="button"
                title={color}
                className={`size-7 rounded-full border-2 ${
                  selected === color && tool === "pencil"
                    ? "border-fg"
                    : "border-border"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setSelected(color);
                  setTool("pencil");
                }}
              />
            ))}
            {onUpdateColor && tool === "pencil" ? (
              <input
                type="color"
                value={selected}
                aria-label="Edit palette color"
                className="size-7 cursor-pointer rounded border-0 bg-transparent"
                onChange={(e) => {
                  const next = e.target.value;
                  const index = palette.indexOf(selected);
                  if (index !== -1) onUpdateColor(index, next);
                  setSelected(next);
                }}
              />
            ) : null}
          </div>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-crimson/50 px-3 text-xs text-crimson"
          onClick={() => {
            onChange(Array.from({ length: pixelSize }, () => Array(pixelSize).fill("")));
          }}
        >
          <Trash2 className="size-3.5" />
          Clear frame
        </button>
      </div>
    </div>
  );
}

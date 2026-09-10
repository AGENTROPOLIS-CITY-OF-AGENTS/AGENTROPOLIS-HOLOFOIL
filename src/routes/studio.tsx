import { createFileRoute } from "@tanstack/react-router";
import JSZip from "jszip";
import { useMemo, useState } from "react";
import { MemberWorkspace } from "@/components/access/MemberWorkspace";
import { HolofoilCard } from "@/components/holofoil/HolofoilCard";
import { PixelEditor } from "@/components/holofoil/PixelEditor";
import { PixelGrid } from "@/components/holofoil/PixelGrid";
import { playTone } from "@/lib/holofoil/audio";
import {
  applyFoilPreset,
  DEFAULT_MATERIAL,
  FOIL_TYPES,
  exportMaterialJson,
  foilLabel,
  type FoilType,
  type MaterialConfig,
} from "@/lib/holofoil/materials";
import {
  galleryCharacters,
  generateProceduralSprite,
} from "@/lib/holofoil/procedural";
import type { PixelSprite, SpriteStyle } from "@/lib/holofoil/types";

export const Route = createFileRoute("/studio")({ component: StudioRoute });

function StudioRoute() {
  return (
    <MemberWorkspace capability="holofoil.card-studio.use" title="Card Studio">
      <CardStudioPage />
    </MemberWorkspace>
  );
}

const STYLES: SpriteStyle[] = [
  "retro-classic",
  "cyberpunk-16bit",
  "gameboy-mono",
  "fantasy-rpg",
];

function toSprite(baked: ReturnType<typeof generateProceduralSprite>): PixelSprite {
  return {
    name: baked.name,
    creator: "Holofoil Studio",
    prompt: baked.prompt,
    style: baked.style,
    colors: baked.colors,
    pixelSize: baked.pixelSize,
    frames: baked.animations,
    stats: baked.stats,
  };
}

function CardStudioPage() {
  const [prompt, setPrompt] = useState("Obsidian relic warden with cyan visor");
  const [style, setStyle] = useState<SpriteStyle>("cyberpunk-16bit");
  const [sprite, setSprite] = useState<PixelSprite>(() =>
    toSprite(generateProceduralSprite(prompt, style, 16)),
  );
  const [anim, setAnim] = useState("idle");
  const [frameIndex, setFrameIndex] = useState(0);
  const [material, setMaterial] = useState<MaterialConfig>({
    ...DEFAULT_MATERIAL,
    seed: "card-studio",
  });

  const frames = sprite.frames[anim] ?? sprite.frames.idle ?? [];
  const current = frames[frameIndex] ?? frames[0];

  const generate = () => {
    const next = toSprite(generateProceduralSprite(prompt, style, 16));
    setSprite(next);
    setAnim("idle");
    setFrameIndex(0);
    playTone("sonar");
  };

  const loadGallery = (name: string) => {
    const found = galleryCharacters.find((g) => g.name === name);
    if (!found) return;
    setSprite({
      name: found.name,
      creator: "Gallery",
      prompt: found.prompt,
      style: found.style,
      colors: found.colors,
      pixelSize: found.pixelSize,
      frames: found.animations,
      stats: found.stats,
    });
    setPrompt(found.prompt);
    setStyle(found.style);
    playTone("beep");
  };

  const metadata = useMemo(
    () => ({
      name: sprite.name,
      prompt: sprite.prompt,
      style: sprite.style,
      pixelSize: sprite.pixelSize,
      stats: sprite.stats,
      animations: Object.keys(sprite.frames),
      material: JSON.parse(exportMaterialJson(material)),
      exportedAt: new Date().toISOString(),
    }),
    [sprite, material],
  );

  const downloadMetadata = () => {
    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sprite.name.replace(/\s+/g, "_")}_meta.json`;
    a.click();
    URL.revokeObjectURL(url);
    playTone("confirm");
  };

  const downloadSheet = () => {
    const size = sprite.pixelSize;
    const canvas = document.createElement("canvas");
    canvas.width = size * frames.length;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    frames.forEach((frame, i) => {
      frame.forEach((row, y) => {
        row.forEach((color, x) => {
          if (!color) return;
          ctx.fillStyle = color;
          ctx.fillRect(i * size + x, y, 1, 1);
        });
      });
    });
    const a = document.createElement("a");
    a.download = `${sprite.name}_${anim}_sheet.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    playTone("laser");
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    zip.file("metadata.json", JSON.stringify(metadata, null, 2));
    zip.file("material.json", exportMaterialJson(material));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sprite.name.replace(/\s+/g, "_")}_pack.zip`;
    a.click();
    URL.revokeObjectURL(url);
    playTone("confirm");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <p className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">
          Card Studio
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
          Author a collectible, then wrap it in foil.
        </h1>
        <p className="mt-2 text-sm text-muted">
          Procedural sprites, pixel editing, trading-card presentation, metadata
          export. No paid generation and no minting.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row">
        <label className="flex-1 text-sm">
          <span className="mb-1 block text-muted">Prompt</span>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-bg-elevated px-3 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Style</span>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as SpriteStyle)}
            className="h-11 rounded-md border border-border bg-bg-elevated px-3 text-sm"
          >
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="mt-auto h-11 rounded-full bg-cyan px-5 text-sm font-medium text-bg"
          onClick={generate}
        >
          Generate sprite
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {galleryCharacters.map((g) => (
          <button
            key={g.name}
            type="button"
            className="min-h-11 rounded-full border border-border px-3 text-xs text-muted hover:text-fg"
            onClick={() => loadGallery(g.name)}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FOIL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={`min-h-11 rounded-full border px-3 text-xs ${
              material.foilType === type
                ? "border-cyan text-cyan"
                : "border-border text-muted"
            }`}
            onClick={() => {
              setMaterial(applyFoilPreset(type as FoilType, material));
              playTone("beep");
            }}
          >
            {foilLabel(type)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <PixelEditor
          grid={current ?? []}
          palette={sprite.colors}
          pixelSize={sprite.pixelSize}
          onChange={(next) => {
            const copy = { ...sprite, frames: { ...sprite.frames } };
            const list = [...(copy.frames[anim] ?? [])];
            list[frameIndex] = next;
            copy.frames[anim] = list;
            setSprite(copy);
          }}
          onUpdateColor={(index, color) => {
            const colors = [...sprite.colors];
            colors[index] = color;
            setSprite({ ...sprite, colors });
          }}
        />
        <div className="space-y-4">
          <HolofoilCard
            material={material}
            title={sprite.name}
            subtitle={`${sprite.style} · HP ${sprite.stats.hp}`}
          >
            <div className="flex h-full items-center justify-center p-4">
              <PixelGrid frame={current} className="w-40" />
            </div>
          </HolofoilCard>
          <div className="flex flex-wrap gap-2">
            {Object.keys(sprite.frames).map((name) => (
              <button
                key={name}
                type="button"
                className={`min-h-10 rounded-full border px-3 text-xs ${
                  anim === name ? "border-cyan text-cyan" : "border-border text-muted"
                }`}
                onClick={() => {
                  setAnim(name);
                  setFrameIndex(0);
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, frames.length - 1)}
            value={frameIndex}
            onChange={(e) => setFrameIndex(Number(e.target.value))}
            className="w-full accent-cyan"
            aria-label="Frame"
          />
          <div className="grid gap-2">
            <button
              type="button"
              className="min-h-11 rounded-full border border-border text-sm"
              onClick={downloadSheet}
            >
              Export spritesheet
            </button>
            <button
              type="button"
              className="min-h-11 rounded-full border border-border text-sm"
              onClick={downloadMetadata}
            >
              Export metadata
            </button>
            <button
              type="button"
              className="min-h-11 rounded-full bg-cyan text-sm font-medium text-bg"
              onClick={() => void downloadZip()}
            >
              Export pack
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

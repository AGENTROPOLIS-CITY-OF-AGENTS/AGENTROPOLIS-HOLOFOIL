import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { HolofoilCard } from "@/components/holofoil/HolofoilCard";
import { playTone } from "@/lib/holofoil/audio";
import {
  applyFoilPreset,
  DEFAULT_MATERIAL,
  FOIL_TYPES,
  foilLabel,
  hashMaterial,
  type FoilType,
  type MaterialConfig,
  exportMaterialJson,
  validateMaterialConfig,
} from "@/lib/holofoil/materials";

export const Route = createFileRoute("/lab")({ component: MaterialLabPage });

function MaterialLabPage() {
  const [material, setMaterial] = useState<MaterialConfig>(DEFAULT_MATERIAL);
  const [copied, setCopied] = useState(false);
  const json = useMemo(() => exportMaterialJson(material), [material]);
  const foilHash = useMemo(() => hashMaterial(material), [material]);

  const patch = (partial: Partial<MaterialConfig>) => {
    setMaterial(validateMaterialConfig({ ...material, ...partial }).value);
  };

  const exportConfig = async () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `holofoil-${material.foilType}-${foilHash}.json`;
    a.click();
    URL.revokeObjectURL(url);
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      playTone("confirm");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      playTone("beep");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <p className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">
          Material Lab
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
          Configure a deterministic foil.
        </h1>
        <p className="mt-2 text-sm text-muted">
          Replaces the retired inscription catalog. Adjust the material, inspect
          pointer and tilt response, then export a configuration another
          Agentropolis application can consume.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="mx-auto w-full max-w-sm">
          <HolofoilCard
            material={material}
            title="Lab Specimen"
            subtitle={`${foilLabel(material.foilType)} · ${foilHash}`}
          />
        </div>
        <div className="space-y-6">
          <fieldset>
            <legend className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Foil type
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {FOIL_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`min-h-11 rounded-md border px-2 text-left text-xs ${
                    material.foilType === type
                      ? "border-cyan bg-bg-subtle text-cyan"
                      : "border-border text-muted hover:text-fg"
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
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Slider
              label="Intensity"
              value={material.intensity}
              onChange={(v) => patch({ intensity: v })}
            />
            <Slider
              label="Refraction"
              value={material.refraction}
              onChange={(v) => patch({ refraction: v })}
            />
            <Slider
              label="Opacity"
              value={material.opacity}
              onChange={(v) => patch({ opacity: v })}
            />
            <Slider
              label="Grain"
              value={material.grain}
              onChange={(v) => patch({ grain: v })}
            />
            <Slider
              label="Fresnel"
              value={material.fresnel}
              onChange={(v) => patch({ fresnel: v })}
            />
            <Slider
              label="Animation speed"
              value={material.animationSpeed}
              onChange={(v) => patch({ animationSpeed: v })}
            />
            <Slider
              label="Light direction"
              min={0}
              max={360}
              step={1}
              value={material.lightAzimuth}
              onChange={(v) => patch({ lightAzimuth: v })}
            />
            <Slider
              label="Light elevation"
              min={0}
              max={90}
              step={1}
              value={material.lightElevation}
              onChange={(v) => patch({ lightElevation: v })}
            />
            <label className="block text-sm sm:col-span-2">
              <span className="mb-2 block text-muted">Glow color</span>
              <input
                type="color"
                value={material.glowColor}
                onChange={(e) => patch({ glowColor: e.target.value })}
                className="h-11 w-full rounded-md border border-border bg-bg-subtle"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Toggle
              label="Pointer response"
              checked={material.pointerResponse}
              onChange={(v) => patch({ pointerResponse: v })}
            />
            <Toggle
              label="Mobile tilt"
              checked={material.mobileTilt}
              onChange={(v) => patch({ mobileTilt: v })}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="min-h-11 rounded-full border border-border px-4 text-sm"
              onClick={() => {
                setMaterial(DEFAULT_MATERIAL);
                playTone("rip");
              }}
            >
              Reset Material
            </button>
            <button
              type="button"
              className="min-h-11 rounded-full bg-cyan px-4 text-sm font-medium text-bg"
              onClick={() => void exportConfig()}
            >
              {copied ? "Copied configuration" : "Export Configuration"}
            </button>
          </div>

          <pre className="overflow-auto rounded-[18px] border border-border bg-bg p-4 font-mono text-[11px] leading-relaxed text-muted">
            {json}
          </pre>
        </div>
      </div>
    </main>
  );
}

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 flex justify-between text-muted">
        {label}
        <span className="font-mono text-cyan">{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`min-h-11 rounded-full border px-4 text-sm ${
        checked ? "border-lime text-lime" : "border-border text-muted"
      }`}
    >
      {label}: {checked ? "on" : "off"}
    </button>
  );
}

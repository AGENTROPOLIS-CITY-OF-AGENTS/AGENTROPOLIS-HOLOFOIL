import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { playTone } from "@/lib/holofoil/audio";
import { composeStoryboard } from "@/lib/holofoil/storyboard";
import type { StoryboardDeck } from "@/lib/holofoil/types";

export const Route = createFileRoute("/storyboard")({
  component: StoryboardPage,
});

const TEMPLATES = [
  {
    name: "Relic Reveal",
    text: "An operator unveils an obsidian foil relic under museum glass in a quiet Agentropolis vault",
  },
  {
    name: "Prism Turn",
    text: "A prismatic collectible rotates under a single cyan key light while grain and fresnel are inspected",
  },
  {
    name: "Stage Walk",
    text: "A tracking shot through eight material pavilions as each booth answers the camera with a different foil",
  },
];

const CAMERAS = [
  "Cinematic Wide-Shot",
  "Macro Insert",
  "Tracking Orbit",
  "Overhead Plan",
];

function StoryboardPage() {
  const [storyPrompt, setStoryPrompt] = useState(TEMPLATES[0].text);
  const [stylePreset, setStylePreset] = useState("Cinematic still, 2027 product photography");
  const [cameraPreset, setCameraPreset] = useState(CAMERAS[0]);
  const [lightingPreset, setLightingPreset] = useState("Cyan key / obsidian fill");
  const [deck, setDeck] = useState<StoryboardDeck | null>(null);
  const [busy, setBusy] = useState(false);

  const compile = async () => {
    setBusy(true);
    playTone("sonar");
    try {
      const res = await fetch("/api/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyPrompt,
          stylePreset,
          cameraPreset,
          lightingPreset,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { storyboard?: StoryboardDeck };
        if (data.storyboard) {
          setDeck(data.storyboard);
          setBusy(false);
          playTone("confirm");
          return;
        }
      }
    } catch {
      // local fallback
    }
    setDeck(
      composeStoryboard({
        storyPrompt,
        stylePreset,
        cameraPreset,
        lightingPreset,
      }),
    );
    setBusy(false);
  };

  const exportDeck = () => {
    if (!deck) return;
    const blob = new Blob([JSON.stringify(deck, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deck.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playTone("confirm");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <p className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">
          Storyboard Studio
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
          Sequence a foil reveal.
        </h1>
        <p className="mt-2 text-sm text-muted">
          Local, deterministic beats. No paid generation.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="text-sm lg:col-span-2">
          <span className="mb-1 block text-muted">Story</span>
          <textarea
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-bg-elevated p-3"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Style</span>
          <input
            value={stylePreset}
            onChange={(e) => setStylePreset(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-bg-elevated px-3"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Camera</span>
          <select
            value={cameraPreset}
            onChange={(e) => setCameraPreset(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-bg-elevated px-3"
          >
            {CAMERAS.map((camera) => (
              <option key={camera} value={camera}>
                {camera}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm lg:col-span-2">
          <span className="mb-1 block text-muted">Lighting</span>
          <input
            value={lightingPreset}
            onChange={(e) => setLightingPreset(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-bg-elevated px-3"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.name}
            type="button"
            className="min-h-11 rounded-full border border-border px-3 text-xs text-muted"
            onClick={() => setStoryPrompt(t.text)}
          >
            {t.name}
          </button>
        ))}
        <button
          type="button"
          className="min-h-11 rounded-full bg-cyan px-4 text-sm font-medium text-bg"
          onClick={() => void compile()}
          disabled={busy}
        >
          {busy ? "Compiling…" : "Compile storyboard"}
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full border border-border px-4 text-sm disabled:opacity-40"
          onClick={exportDeck}
          disabled={!deck}
        >
          Export JSON
        </button>
      </div>

      {deck ? (
        <ol className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {deck.panels.map((panel) => (
            <li
              key={panel.panelNumber}
              className="rounded-[18px] border border-border bg-bg-elevated p-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan">
                Panel {panel.panelNumber}
              </p>
              <h2 className="mt-2 font-display text-xl">{panel.title}</h2>
              <p className="mt-2 text-sm text-muted">{panel.description}</p>
              <p className="mt-3 text-xs text-subtle">
                {panel.cameraAngle} · {panel.lighting}
              </p>
              <p className="mt-2 text-xs text-muted">{panel.directorNotes}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </main>
  );
}

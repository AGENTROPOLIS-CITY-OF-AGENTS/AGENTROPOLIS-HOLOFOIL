import type { LayerAsset } from "./types.ts";

/** Deterministic FNV-1a. No model required. */
export function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function traitsFromLayers(layers: LayerAsset[]): Record<string, string> {
  const visible = [...layers].filter((l) => l.visible).sort((a, b) => a.z - b.z);
  const traits: Record<string, string> = {};
  for (const layer of visible) {
    if (layer.value === "None") continue;
    traits[layer.group] = layer.value;
  }
  return traits;
}

export function dnaFromTraits(traits: Record<string, string>, seed: string): string {
  const body = Object.keys(traits)
    .sort()
    .map((key) => `${key}:${traits[key]}`)
    .join("|");
  return `hf:${fnv1a(`${seed}::${body}`)}`;
}

export function dnaFromLayers(layers: LayerAsset[], seed: string): string {
  return dnaFromTraits(traitsFromLayers(layers), seed);
}

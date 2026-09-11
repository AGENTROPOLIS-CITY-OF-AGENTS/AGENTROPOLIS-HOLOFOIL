import type { TraitRule } from "../../contracts/creator-cloud-job.v1.ts";
import { dnaFromTraits, traitsFromLayers } from "./dna.ts";
import type {
  CapacityReport,
  GeneratedItem,
  LaunchEstimate,
  LayerAsset,
  ValidationReport,
} from "./types.ts";

function groupOptions(layers: LayerAsset[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const locked = new Map<string, string>();
  for (const layer of layers) {
    if (layer.locked) locked.set(layer.group, layer.value);
  }
  for (const layer of layers) {
    if (locked.has(layer.group) && layer.value !== locked.get(layer.group)) continue;
    const list = map.get(layer.group) ?? [];
    if (!list.includes(layer.value)) list.push(layer.value);
    map.set(layer.group, list);
  }
  return map;
}

function comboValid(traits: Record<string, string>, rules: TraitRule[]): boolean {
  for (const rule of rules) {
    const current = traits[rule.trait];
    if (rule.value && current !== rule.value && (rule.excludeWith || rule.requireWith)) {
      continue;
    }
    if (rule.lock && current && rule.value && current !== rule.value) return false;
    for (const pair of rule.excludeWith ?? []) {
      if (current === (rule.value ?? current) && traits[pair.trait] === pair.value) return false;
    }
    for (const pair of rule.requireWith ?? []) {
      if (current === (rule.value ?? current) && traits[pair.trait] !== pair.value) return false;
    }
  }
  return true;
}

function cartesian(groups: Map<string, string[]>): Record<string, string>[] {
  const keys = [...groups.keys()];
  let combos: Record<string, string>[] = [{}];
  for (const key of keys) {
    const values = groups.get(key) ?? [];
    const next: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const value of values) next.push({ ...combo, [key]: value });
    }
    combos = next;
    if (combos.length > 20000) break;
  }
  return combos;
}

export function capacityReport(
  layers: LayerAsset[],
  rules: TraitRule[],
  requested: number,
  uniqueRequired: boolean,
): CapacityReport {
  const groups = groupOptions(layers);
  const raw = cartesian(groups);
  const estimated = raw.length >= 20000;
  const valid = raw.filter((traits) => comboValid(traits, rules));
  const possible = valid.length;
  const safe = !uniqueRequired || possible >= requested;
  const message = uniqueRequired
    ? `You currently have enough valid combinations for approximately ${possible.toLocaleString()} unique collectibles. Your requested ${requested.toLocaleString()}-piece collection is ${safe ? "safe" : "not possible without relaxing rules"}.`
    : `${possible.toLocaleString()} valid combinations available for a ${requested.toLocaleString()}-piece run.`;
  return { possible, requested, safe, uniqueRequired, estimated, message };
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedNum(seed: string): number {
  let n = 2166136261;
  for (let i = 0; i < seed.length; i += 1) n = Math.imul(n ^ seed.charCodeAt(i), 16777619);
  return n >>> 0;
}

export function generateCollection(
  layers: LayerAsset[],
  rules: TraitRule[],
  seed: string,
  count: number,
  uniqueRequired: boolean,
): { items: GeneratedItem[]; validation: ValidationReport } {
  const groups = groupOptions(layers);
  const valid = cartesian(groups).filter((traits) => comboValid(traits, rules));
  const rand = mulberry32(seedNum(seed));
  const pool = [...valid];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const items: GeneratedItem[] = [];
  const seen = new Set<string>();
  let invalid = 0;
  const take = uniqueRequired ? Math.min(count, pool.length) : count;
  for (let i = 0; i < take; i += 1) {
    const traits = pool[i % pool.length] ?? traitsFromLayers(layers);
    const dna = dnaFromTraits(traits, seed);
    if (seen.has(dna)) {
      if (uniqueRequired) {
        invalid += 1;
        continue;
      }
    }
    seen.add(dna);
    const layerIds = layers
      .filter((l) => l.visible && traits[l.group] === l.value)
      .sort((a, b) => a.z - b.z)
      .map((l) => l.id);
    items.push({ index: items.length + 1, dna, traits, layerIds });
  }
  const duplicateCount = items.length - seen.size;
  const blockers: string[] = [];
  if (uniqueRequired && items.length < count) {
    blockers.push(`Only ${items.length} unique combinations exist for a ${count} request.`);
  }
  return {
    items,
    validation: {
      uniqueOk: uniqueRequired ? items.length === count && seen.size === items.length : true,
      duplicateCount: Math.max(0, duplicateCount),
      invalidCount: invalid,
      blockers,
    },
  };
}

export function metadataFor(item: GeneratedItem, projectName: string) {
  return {
    name: `${projectName} #${item.index}`,
    dna: item.dna,
    attributes: Object.entries(item.traits).map(([trait_type, value]) => ({
      trait_type,
      value,
    })),
  };
}

export function launchEstimate(supply: number, destination: "WEB2_ONLY" | "WEB3"): LaunchEstimate {
  const setup = 0;
  const storage = Math.max(2, Math.round(supply * 0.012 * 100) / 100);
  const network = destination === "WEB3" ? Math.max(8, Math.round(supply * 0.004 * 100) / 100) : 0;
  const optional = 0;
  const total = Math.round((setup + storage + network + optional) * 100) / 100;
  return {
    setup,
    storage,
    network,
    optional,
    total,
    currency: "USD",
    note:
      destination === "WEB3"
        ? "Network fee is an estimate only. Live execution requires authority, simulation, and approval."
        : "Web2 export has no network fee. Storage is an estimate for hosted files.",
  };
}

export function compileCsv(items: GeneratedItem[]): string {
  const traits = [...new Set(items.flatMap((item) => Object.keys(item.traits)))].sort();
  const header = ["index", "dna", ...traits];
  const rows = items.map((item) =>
    [String(item.index), item.dna, ...traits.map((t) => item.traits[t] ?? "")].join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

export function parseTraitCsv(text: string): TraitRule[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const traitIdx = header.indexOf("trait");
  const valueIdx = header.indexOf("value");
  const lockIdx = header.indexOf("lock");
  if (traitIdx < 0) return [];
  const rules: TraitRule[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(",").map((c) => c.trim());
    const trait = cols[traitIdx];
    if (!trait) continue;
    rules.push({
      trait,
      value: valueIdx >= 0 ? cols[valueIdx] : undefined,
      lock: lockIdx >= 0 ? /^(1|true|yes)$/i.test(cols[lockIdx] ?? "") : false,
    });
  }
  return rules;
}

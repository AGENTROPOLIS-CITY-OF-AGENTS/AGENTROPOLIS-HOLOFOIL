import { assertCreatorCloudJob, type CreatorCloudJobV1 } from "../../contracts/creator-cloud-job.v1.ts";
import { sampleCatalog } from "./catalog.ts";
import { instantiateLaunchRecipe } from "./launch.ts";
import type { WorkspaceState } from "./types.ts";

export function newJobId(): string {
  return `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function initialWorkspace(): WorkspaceState {
  const job: CreatorCloudJobV1 = {
    version: "1.0.0",
    jobId: "job-draft",
    mode: "EASY",
    action: "COMPOSE",
    project: {
      name: "Untitled drop",
      collectionType: "DIGITAL_ART",
      requestedSupply: 333,
    },
    source: {
      creatorRepo: "AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-CREATOR",
      assetCatalogRef: "sample://holofoil-starter",
    },
    composition: {
      uniqueRequired: true,
      randomize: false,
      rules: [],
    },
    holofoil: {
      enabled: true,
      preset: "obsidian-foil",
    },
    publish: {
      destination: "WEB2_ONLY",
      priceDisplay: "Free",
    },
    authority: {
      humanApprovalRequired: true,
    },
  };
  assertCreatorCloudJob(job);
  return {
    job,
    layers: sampleCatalog(),
    rules: [],
    seed: "holofoil-drop-0001",
    uniqueRequired: true,
    foilEnabled: true,
    foilType: "obsidian-foil",
    ideaText: "",
    priceDisplay: "",
    earlyAccess: "",
    earningsPercent: 5,
    destination: "WEB2_ONLY",
    generated: [],
    agentLog: [],
    step: 0,
    launch: instantiateLaunchRecipe("SIMPLE_DROP"),
    dropVerified: false,
    marketplaceRoutes: [],
  };
}

export function visibleStack(state: WorkspaceState) {
  return [...state.layers].filter((l) => l.visible).sort((a, b) => a.z - b.z);
}

export function selectOption(state: WorkspaceState, group: string, id: string): WorkspaceState {
  const layers = state.layers.map((layer) =>
    layer.group === group ? { ...layer, visible: layer.id === id } : layer,
  );
  return { ...state, layers };
}

export function toggleLock(state: WorkspaceState, id: string): WorkspaceState {
  const target = state.layers.find((l) => l.id === id);
  if (!target) return state;
  const layers = state.layers.map((layer) => {
    if (layer.group !== target.group) return layer;
    if (layer.id === id) return { ...layer, locked: !layer.locked, visible: true };
    return { ...layer, locked: false };
  });
  return { ...state, layers };
}

export function moveZ(state: WorkspaceState, id: string, dir: -1 | 1): WorkspaceState {
  const layers = [...state.layers].sort((a, b) => a.z - b.z);
  const index = layers.findIndex((l) => l.id === id);
  const swap = index + dir;
  if (index < 0 || swap < 0 || swap >= layers.length) return state;
  const a = layers[index];
  const b = layers[swap];
  const next = state.layers.map((layer) => {
    if (layer.id === a.id) return { ...layer, z: b.z };
    if (layer.id === b.id) return { ...layer, z: a.z };
    return layer;
  });
  return { ...state, layers: next };
}

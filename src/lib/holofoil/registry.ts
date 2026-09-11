import { DEFAULT_MATERIAL, type FoilType } from "./materials";

export interface HolofoilTelemetry {
  foilType: FoilType;
  intensity: number;
  glowColor: string;
  opacity: number;
}

export interface HolofoilNodeInput {
  assetId: string;
  ownerId: string;
  coordinateVector: { hallId: string; x: number; y: number; z: number };
  refractionTelemetry?: Partial<HolofoilTelemetry>;
  metadataPayload: {
    title: string;
    sourceSeed?: string;
    engineMetadata?: Record<string, unknown>;
  };
}

export interface HolofoilNode {
  assetId: string;
  ownerId: string;
  coordinateVector: { hallId: string; x: number; y: number; z: number };
  refractionTelemetry: HolofoilTelemetry;
  metadataPayload: {
    title: string;
    sourceSeed?: string;
    engineMetadata?: Record<string, unknown>;
  };
  status: "active" | "instanced" | "depleted";
  createdAt: string;
  updatedAt: string;
}

const nodes = new Map<string, HolofoilNode>();

function seed() {
  if (nodes.size > 0) return;
  const now = new Date().toISOString();
  const seedNodes: HolofoilNode[] = [
    {
      assetId: "specimen-aurora-stag",
      ownerId: "holofoil-lab",
      coordinateVector: { hallId: "3d-specimen-dex", x: 4, y: 1.2, z: -2 },
      refractionTelemetry: {
        foilType: "rainbow-diffraction",
        intensity: 0.84,
        glowColor: "#3ee0ff",
        opacity: 0.9,
      },
      metadataPayload: {
        title: "Aurora Stag",
        sourceSeed: "aurora-010",
      },
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
    {
      assetId: "specimen-starcore",
      ownerId: "holofoil-lab",
      coordinateVector: { hallId: "3d-specimen-dex", x: -3, y: 1.4, z: 3 },
      refractionTelemetry: {
        foilType: "obsidian-foil",
        intensity: 0.6,
        glowColor: DEFAULT_MATERIAL.glowColor,
        opacity: 0.8,
      },
      metadataPayload: {
        title: "Starcore Relic",
        sourceSeed: "apex-cosmic-888",
      },
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const node of seedNodes) nodes.set(node.assetId, node);
}

seed();

export function registerHoloNode(input: HolofoilNodeInput): HolofoilNode {
  const existing = nodes.get(input.assetId);
  const now = new Date().toISOString();
  const node: HolofoilNode = {
    assetId: input.assetId,
    ownerId: input.ownerId,
    coordinateVector: {
      hallId: input.coordinateVector.hallId || "3d-specimen-dex",
      x: input.coordinateVector.x ?? 0,
      y: input.coordinateVector.y ?? 0,
      z: input.coordinateVector.z ?? 0,
    },
    refractionTelemetry: {
      foilType: input.refractionTelemetry?.foilType || "holographic",
      intensity:
        typeof input.refractionTelemetry?.intensity === "number"
          ? input.refractionTelemetry.intensity
          : 0.75,
      glowColor: input.refractionTelemetry?.glowColor || "#3ee0ff",
      opacity:
        typeof input.refractionTelemetry?.opacity === "number"
          ? input.refractionTelemetry.opacity
          : 0.9,
    },
    metadataPayload: {
      title: input.metadataPayload.title,
      sourceSeed: input.metadataPayload.sourceSeed || "manual-seed",
      engineMetadata: input.metadataPayload.engineMetadata || {},
    },
    status: "active",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  nodes.set(node.assetId, node);
  return node;
}

export function listHallNodes(hallId: string): HolofoilNode[] {
  const aliases = new Set([hallId]);
  if (hallId === "3d-specimen-dex" || hallId === "creature-tcg") {
    aliases.add("3d-specimen-dex");
    aliases.add("creature-tcg");
  }
  return [...nodes.values()].filter(
    (node) =>
      aliases.has(node.coordinateVector.hallId) && node.status === "active",
  );
}

export function updateTelemetry(
  assetId: string,
  telemetry: Partial<HolofoilTelemetry>,
  status?: HolofoilNode["status"],
): HolofoilNode | null {
  const node = nodes.get(assetId);
  if (!node) return null;
  node.refractionTelemetry = { ...node.refractionTelemetry, ...telemetry };
  if (status) node.status = status;
  node.updatedAt = new Date().toISOString();
  return node;
}

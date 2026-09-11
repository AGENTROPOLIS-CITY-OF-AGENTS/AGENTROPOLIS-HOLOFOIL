export const MATERIAL_SCHEMA_ID = "agentropolis.holofoil.material.v1" as const;

export const FOIL_TYPES = [
  "holographic",
  "chromatic",
  "prism",
  "neon-glitch",
  "brushed-foil",
  "rainbow-diffraction",
  "serialized-collectible",
  "museum-glass",
  "obsidian-foil",
  "custom",
] as const;

export type FoilType = (typeof FOIL_TYPES)[number];

export interface MaterialConfig {
  schema: typeof MATERIAL_SCHEMA_ID;
  version: 1;
  foilType: FoilType;
  intensity: number;
  refraction: number;
  glowColor: string;
  opacity: number;
  grain: number;
  fresnel: number;
  lightAzimuth: number;
  lightElevation: number;
  pointerResponse: boolean;
  mobileTilt: boolean;
  animationSpeed: number;
  seed: string;
}

export const DEFAULT_MATERIAL: MaterialConfig = {
  schema: MATERIAL_SCHEMA_ID,
  version: 1,
  foilType: "holographic",
  intensity: 0.72,
  refraction: 0.55,
  glowColor: "#3ee0ff",
  opacity: 0.86,
  grain: 0.28,
  fresnel: 0.62,
  lightAzimuth: 38,
  lightElevation: 42,
  pointerResponse: true,
  mobileTilt: true,
  animationSpeed: 0.45,
  seed: "holofoil-origin-0001",
};

export const FOIL_PRESETS: Record<FoilType, Partial<MaterialConfig>> = {
  holographic: {
    foilType: "holographic",
    intensity: 0.78,
    refraction: 0.62,
    glowColor: "#3ee0ff",
    opacity: 0.88,
    grain: 0.22,
    fresnel: 0.7,
  },
  chromatic: {
    foilType: "chromatic",
    intensity: 0.7,
    refraction: 0.8,
    glowColor: "#7ad7ff",
    opacity: 0.82,
    grain: 0.18,
    fresnel: 0.55,
  },
  prism: {
    foilType: "prism",
    intensity: 0.84,
    refraction: 0.9,
    glowColor: "#8b7cff",
    opacity: 0.9,
    grain: 0.12,
    fresnel: 0.78,
  },
  "neon-glitch": {
    foilType: "neon-glitch",
    intensity: 0.92,
    refraction: 0.48,
    glowColor: "#3ee0ff",
    opacity: 0.94,
    grain: 0.4,
    fresnel: 0.5,
    animationSpeed: 0.85,
  },
  "brushed-foil": {
    foilType: "brushed-foil",
    intensity: 0.58,
    refraction: 0.28,
    glowColor: "#c9d4dc",
    opacity: 0.76,
    grain: 0.55,
    fresnel: 0.42,
  },
  "rainbow-diffraction": {
    foilType: "rainbow-diffraction",
    intensity: 0.9,
    refraction: 0.95,
    glowColor: "#8b7cff",
    opacity: 0.92,
    grain: 0.16,
    fresnel: 0.82,
  },
  "serialized-collectible": {
    foilType: "serialized-collectible",
    intensity: 0.66,
    refraction: 0.5,
    glowColor: "#b6f25c",
    opacity: 0.8,
    grain: 0.2,
    fresnel: 0.6,
  },
  "museum-glass": {
    foilType: "museum-glass",
    intensity: 0.32,
    refraction: 0.22,
    glowColor: "#e8eef2",
    opacity: 0.42,
    grain: 0.08,
    fresnel: 0.92,
  },
  "obsidian-foil": {
    foilType: "obsidian-foil",
    intensity: 0.48,
    refraction: 0.35,
    glowColor: "#3ee0ff",
    opacity: 0.7,
    grain: 0.34,
    fresnel: 0.88,
  },
  custom: {
    foilType: "custom",
    intensity: 0.72,
    refraction: 0.55,
    glowColor: "#3ee0ff",
    opacity: 0.86,
    grain: 0.28,
    fresnel: 0.62,
  },
};

const HEX = /^#([0-9a-fA-F]{6})$/;

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function roundFixed(n: number, digits = 4) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export interface MaterialValidation {
  ok: boolean;
  errors: string[];
  value: MaterialConfig;
}

export function validateMaterialConfig(input: unknown): MaterialValidation {
  const errors: string[] = [];
  const src =
    input && typeof input === "object"
      ? (input as Partial<MaterialConfig>)
      : {};

  const foilType = FOIL_TYPES.includes(src.foilType as FoilType)
    ? (src.foilType as FoilType)
    : DEFAULT_MATERIAL.foilType;
  if (!FOIL_TYPES.includes(src.foilType as FoilType)) {
    errors.push("foilType must be a known Holofoil material.");
  }

  const glowColor =
    typeof src.glowColor === "string" && HEX.test(src.glowColor)
      ? src.glowColor.toLowerCase()
      : DEFAULT_MATERIAL.glowColor;
  if (typeof src.glowColor !== "string" || !HEX.test(src.glowColor)) {
    errors.push("glowColor must be a #rrggbb hex value.");
  }

  const seed =
    typeof src.seed === "string" && src.seed.trim().length > 0
      ? src.seed.trim().slice(0, 64)
      : DEFAULT_MATERIAL.seed;

  const value: MaterialConfig = {
    schema: MATERIAL_SCHEMA_ID,
    version: 1,
    foilType,
    intensity: clamp(Number(src.intensity ?? DEFAULT_MATERIAL.intensity), 0, 1),
    refraction: clamp(
      Number(src.refraction ?? DEFAULT_MATERIAL.refraction),
      0,
      1,
    ),
    glowColor,
    opacity: clamp(Number(src.opacity ?? DEFAULT_MATERIAL.opacity), 0, 1),
    grain: clamp(Number(src.grain ?? DEFAULT_MATERIAL.grain), 0, 1),
    fresnel: clamp(Number(src.fresnel ?? DEFAULT_MATERIAL.fresnel), 0, 1),
    lightAzimuth: clamp(
      Number(src.lightAzimuth ?? DEFAULT_MATERIAL.lightAzimuth),
      0,
      360,
    ),
    lightElevation: clamp(
      Number(src.lightElevation ?? DEFAULT_MATERIAL.lightElevation),
      0,
      90,
    ),
    pointerResponse:
      typeof src.pointerResponse === "boolean"
        ? src.pointerResponse
        : DEFAULT_MATERIAL.pointerResponse,
    mobileTilt:
      typeof src.mobileTilt === "boolean"
        ? src.mobileTilt
        : DEFAULT_MATERIAL.mobileTilt,
    animationSpeed: clamp(
      Number(src.animationSpeed ?? DEFAULT_MATERIAL.animationSpeed),
      0,
      1,
    ),
    seed,
  };

  return { ok: errors.length === 0, errors, value };
}

export function applyFoilPreset(
  type: FoilType,
  current: MaterialConfig,
): MaterialConfig {
  return validateMaterialConfig({
    ...current,
    ...FOIL_PRESETS[type],
    foilType: type,
    seed: current.seed,
  }).value;
}

export function canonicalizeMaterial(config: MaterialConfig): MaterialConfig {
  const { value } = validateMaterialConfig(config);
  return {
    schema: MATERIAL_SCHEMA_ID,
    version: 1,
    foilType: value.foilType,
    intensity: roundFixed(value.intensity),
    refraction: roundFixed(value.refraction),
    glowColor: value.glowColor.toLowerCase(),
    opacity: roundFixed(value.opacity),
    grain: roundFixed(value.grain),
    fresnel: roundFixed(value.fresnel),
    lightAzimuth: roundFixed(value.lightAzimuth, 2),
    lightElevation: roundFixed(value.lightElevation, 2),
    pointerResponse: value.pointerResponse,
    mobileTilt: value.mobileTilt,
    animationSpeed: roundFixed(value.animationSpeed),
    seed: value.seed,
  };
}

export function exportMaterialJson(config: MaterialConfig): string {
  const canonical = canonicalizeMaterial(config);
  const ordered: Record<string, unknown> = {
    schema: canonical.schema,
    version: canonical.version,
    foilType: canonical.foilType,
    intensity: canonical.intensity,
    refraction: canonical.refraction,
    glowColor: canonical.glowColor,
    opacity: canonical.opacity,
    grain: canonical.grain,
    fresnel: canonical.fresnel,
    lightAzimuth: canonical.lightAzimuth,
    lightElevation: canonical.lightElevation,
    pointerResponse: canonical.pointerResponse,
    mobileTilt: canonical.mobileTilt,
    animationSpeed: canonical.animationSpeed,
    seed: canonical.seed,
  };
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

export function hashMaterial(config: MaterialConfig): string {
  const json = exportMaterialJson(config).replace(/\s+/g, "");
  let h = 2166136261;
  for (let i = 0; i < json.length; i++) {
    h ^= json.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function foilLabel(type: FoilType): string {
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

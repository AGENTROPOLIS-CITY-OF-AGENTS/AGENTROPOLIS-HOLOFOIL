import type { TraitRule } from "../../contracts/creator-cloud-job.v1.ts";
import { FOIL_TYPES, type FoilType } from "../holofoil/materials.ts";
import { applyRecipe, remainingSpots, shiftPhaseHours } from "./drop.ts";
import { instantiateLaunchRecipe } from "./launch.ts";
import type { WorkspaceState } from "./types.ts";

export interface AgentResult {
  state: WorkspaceState;
  message: string;
  changed: boolean;
}

function lockTrait(state: WorkspaceState, needle: string): WorkspaceState {
  const layers = state.layers.map((layer) => {
    const hit = `${layer.group} ${layer.value}`.toLowerCase().includes(needle);
    if (!hit) return layer;
    return {
      ...layer,
      locked: true,
      visible: true,
    };
  });
  return { ...state, layers };
}

function excludePair(state: WorkspaceState, a: string, b: string): WorkspaceState {
  const left = state.layers.find((l) => l.value.toLowerCase().includes(a));
  const right = state.layers.find((l) => l.value.toLowerCase().includes(b));
  if (!left || !right) return state;
  const rule: TraitRule = {
    trait: left.group,
    value: left.value,
    excludeWith: [{ trait: right.group, value: right.value }],
  };
  return { ...state, rules: [...state.rules, rule] };
}

/** Deterministic command parser. Does not call a model. */
export function applyAgentCommand(state: WorkspaceState, raw: string): AgentResult {
  const text = raw.trim();
  if (!text) return { state, message: "No instruction.", changed: false };
  const lower = text.toLowerCase();

  const pieceMatch = text.match(/(\d{2,5})\s*-\s*piece/i) || text.match(/(\d{2,5})\s+piece/i);
  if (pieceMatch) {
    const supply = Math.max(1, Number(pieceMatch[1]));
    const next = {
      ...state,
      ideaText: text,
      job: {
        ...state.job,
        project: { ...state.job.project, requestedSupply: supply },
      },
    };
    return { state: next, message: `Requested supply set to ${supply}.`, changed: true };
  }

  const supplyMatch = text.match(/(?:supply|create|make)\s+(\d{2,5})/i);
  if (supplyMatch) {
    const supply = Math.max(1, Number(supplyMatch[1]));
    const next = {
      ...state,
      job: {
        ...state.job,
        project: { ...state.job.project, requestedSupply: supply },
      },
    };
    return { state: next, message: `Requested supply set to ${supply}.`, changed: true };
  }

  if (/\block\b/.test(lower)) {
    const needle = lower.replace(/.*lock\s+(this\s+)?/, "").replace(/[."'].*$/, "").trim();
    if (needle) {
      const next = lockTrait(state, needle);
      return { state: next, message: `Locked matching layers for "${needle}".`, changed: true };
    }
  }

  const never = lower.match(/never combine (.+?) with (.+)/);
  if (never) {
    const next = excludePair(state, never[1].trim(), never[2].trim());
    return { state: next, message: `Exclusion recorded: ${never[1].trim()} × ${never[2].trim()}.`, changed: true };
  }

  if (/surprise|randomize/.test(lower)) {
    return {
      state: { ...state, seed: `seed-${Date.now().toString(36)}`, job: { ...state.job, composition: { ...state.job.composition, randomize: true } } },
      message: "Randomized seed. Previews will reshuffle.",
      changed: true,
    };
  }

  if (/show me the launch phases|launch phases/.test(lower)) {
    const launch = state.launch ?? instantiateLaunchRecipe("SIMPLE_DROP");
    const list = launch.phases.map((p) => p.label).join(" → ") || "No phases";
    return { state, message: `Launch recipe ${launch.recipe}: ${list}.`, changed: false };
  }

  if (/early-access spots remain|early access spots/.test(lower)) {
    return { state, message: remainingSpots(state), changed: false };
  }

  const shift = lower.match(/move the public launch (back|forward) (\d+) hours?/);
  if (shift) {
    const hours = Number(shift[2]) * (shift[1] === "back" ? -1 : 1);
    return {
      state: shiftPhaseHours(state, "PUBLIC", hours),
      message: `Public launch moved ${hours} hours. Times stay DRAFT until verified.`,
      changed: true,
    };
  }

  if (/duplicate metadata/.test(lower)) {
    const dups = state.generated.length
      ? new Set(state.generated.map((g) => g.dna)).size !== state.generated.length
      : false;
    return {
      state,
      message: dups ? "Duplicate DNA present in generated set." : "No duplicate DNA in the current generated set.",
      changed: false,
    };
  }

  if (/simulate the launch cost/.test(lower)) {
    return { state: { ...state, step: 4 }, message: "Launch cost is an ESTIMATE on the Price step.", changed: true };
  }

  const recipeHit = (
    [
      ["genesis", "GENESIS_DROP"],
      ["community drop", "COMMUNITY_DROP"],
      ["hype", "HYPE_DROP"],
      ["membership", "MEMBERSHIP_DROP"],
      ["simple", "SIMPLE_DROP"],
    ] as const
  ).find(([key]) => lower.includes(key));
  if (recipeHit && /drop|recipe|launch/.test(lower)) {
    return {
      state: applyRecipe(state, recipeHit[1]),
      message: `Launch recipe set to ${recipeHit[1]}.`,
      changed: true,
    };
  }

  if (/do not publish|prepare .*publish|simulate/.test(lower)) {
    return {
      state: { ...state, job: { ...state.job, action: "SIMULATE" }, step: 5 },
      message: "Prepared for publishing. No live execution.",
      changed: true,
    };
  }

  const foil = FOIL_TYPES.find((type) => lower.includes(type.replace("-", " ")) || lower.includes(type));
  if (foil || /holofoil|foil|holographic/.test(lower)) {
    const type = (foil ?? "holographic") as FoilType;
    return {
      state: { ...state, foilEnabled: true, foilType: type },
      message: `Holofoil material set to ${type}.`,
      changed: true,
    };
  }

  const preview = lower.match(/generate (\d{1,3}) preview/);
  if (preview) {
    return {
      state: { ...state, step: 3 },
      message: `Generate step armed for ${preview[1]} previews.`,
      changed: true,
    };
  }

  const ideaSupply = text.match(/(\d{2,5}).{0,24}collection/i);
  if (ideaSupply) {
    const supply = Number(ideaSupply[1]);
    return {
      state: {
        ...state,
        ideaText: text,
        job: { ...state.job, project: { ...state.job.project, requestedSupply: supply } },
      },
      message: `Captured idea. Supply ${supply}. Traits will not be invented from the description.`,
      changed: true,
    };
  }

  return {
    state: { ...state, ideaText: text },
    message: "Noted. No canonical traits invented from free text.",
    changed: true,
  };
}

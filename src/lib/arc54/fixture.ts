import { applyFoilPreset, canonicalizeMaterial, DEFAULT_MATERIAL, hashMaterial, type MaterialConfig } from "../holofoil/materials.ts";
import { PROOF_ENTITY, type Arc54GameEntity } from "./game-entity.ts";

export const DATA_SOURCE = "FIXTURE" as const;

export type ProofPhase =
  | "card"
  | "loadout"
  | "encounter"
  | "summon"
  | "combat"
  | "reward"
  | "collection"
  | "receipt";

export interface CombatResult {
  entityId: string;
  action: "STRIKE";
  damage: number;
  foeHpBefore: number;
  foeHpAfter: number;
  outcome: "WIN";
  decidedBy: "ARCANA_FIXTURE";
  dataSource: typeof DATA_SOURCE;
}

export interface ProofState {
  entity: Arc54GameEntity;
  loadout: string[];
  selected: string | null;
  phase: ProofPhase;
  combat: CombatResult | null;
  collection: string[];
  dataSource: typeof DATA_SOURCE;
}

export function materialFor(entity: Arc54GameEntity): MaterialConfig {
  return canonicalizeMaterial(
    applyFoilPreset("obsidian-foil", {
      ...DEFAULT_MATERIAL,
      seed: entity.holofoil.deterministicSeed,
      glowColor: "#3ee0ff",
      pointerResponse: true,
      mobileTilt: true,
    }),
  );
}

export function initialProof(): ProofState {
  return {
    entity: PROOF_ENTITY,
    loadout: [],
    selected: null,
    phase: "card",
    combat: null,
    collection: [],
    dataSource: DATA_SOURCE,
  };
}

export function addToLoadout(state: ProofState): ProofState {
  if (state.loadout.includes(state.entity.id)) return { ...state, phase: "loadout" };
  return {
    ...state,
    loadout: [state.entity.id],
    selected: state.entity.id,
    phase: "loadout",
  };
}

export function removeFromLoadout(state: ProofState): ProofState {
  return { ...state, loadout: [], selected: null, phase: "card" };
}

export function startEncounter(state: ProofState): ProofState {
  if (!state.selected) return state;
  return { ...state, phase: "encounter" };
}

export function summon(state: ProofState): ProofState {
  if (state.phase !== "encounter") return state;
  return { ...state, phase: "summon" };
}

export function strike(state: ProofState): ProofState {
  if (state.phase !== "summon" && state.phase !== "combat") return state;
  const atk = state.entity.gameplay.attack ?? 12;
  const combat: CombatResult = {
    entityId: state.entity.id,
    action: "STRIKE",
    damage: atk,
    foeHpBefore: atk,
    foeHpAfter: 0,
    outcome: "WIN",
    decidedBy: "ARCANA_FIXTURE",
    dataSource: DATA_SOURCE,
  };
  return { ...state, phase: "combat", combat };
}

export function revealReward(state: ProofState): ProofState {
  if (!state.combat || state.combat.outcome !== "WIN") return state;
  return { ...state, phase: "reward" };
}

export function collect(state: ProofState): ProofState {
  if (state.phase !== "reward") return state;
  return {
    ...state,
    collection: [state.entity.id],
    phase: "collection",
  };
}

export function openReceipt(state: ProofState): ProofState {
  if (state.phase !== "collection") return state;
  return { ...state, phase: "receipt" };
}

export function identityContinuity(state: ProofState): string[] {
  const ids = [
    state.entity.id,
    ...state.loadout,
    state.selected,
    state.combat?.entityId ?? null,
    ...state.collection,
  ].filter((id): id is string => Boolean(id));
  return [...new Set(ids)];
}

export function proofReceipt(state: ProofState) {
  const material = materialFor(state.entity);
  return {
    id: "hood-terps-proof-001",
    dataSource: DATA_SOURCE,
    wallet: "OFF",
    minting: "OFF",
    payments: "OFF",
    origin_contract: "docs/PLAYABLE-SLICE-PROTOCOL.md",
    entity_id: state.entity.id,
    project_id: state.entity.projectId,
    canon_status: "PLACEHOLDER",
    creator_package: state.entity.creator.productionPackageRef,
    arcana_binding: {
      decidedBy: "ARCANA_FIXTURE",
      combat: state.combat,
    },
    holofoil_binding: {
      materialId: state.entity.holofoil.materialId,
      seed: material.seed,
      foilHash: hashMaterial(material),
    },
    battle_result: state.combat,
    reward_result: state.phase === "reward" || state.collection.length ? "revealed" : null,
    collection_result: state.collection,
    identity_ids: identityContinuity(state),
    fiscal: { wallet: "OFF", minting: "OFF", payments: "OFF" },
  };
}

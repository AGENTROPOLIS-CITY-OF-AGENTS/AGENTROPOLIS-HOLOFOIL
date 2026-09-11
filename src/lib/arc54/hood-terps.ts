/**
 * Source-bound HOOD TERPS proof record.
 * Canon: AGENTROPOLIS-CITY-OF-AGENTS/HOOD-TERPS
 * Extension contract: ARCANA-54/contracts/hood-terps.entity-extension.v1.ts
 * Holofoil binding: contracts/hood-terps-holofoil-binding.v1.ts
 * Gaming fixture: AGENTROPOLIS-GAMING-DISTRICT/fixtures/hood-terps/vertical-slice.v1.json
 * Origin PSP: AGENTROPOLIS-UTILITY-GRID/utilities/origin-engine/contracts/hood-terps-psp-profile.v1.json
 *
 * Do not invent names, lore, abilities, stats, rarity, or traits.
 */

import type { HoodTerpsHolofoilBinding } from "../../../contracts/hood-terps-holofoil-binding.v1.ts";
import type { Arc54HolofoilBinding } from "../../contracts/arc54-holofoil-binding.ts";
import { PROOF_ENTITY, PROOF_ENTITY_ID, PROOF_PROJECT_ID, type Arc54GameEntity } from "./game-entity.ts";

export const SOURCE_REPO = "AGENTROPOLIS-CITY-OF-AGENTS/HOOD-TERPS" as const;
export const SUPPLY_CAP = 3333;
export const PLACEHOLDER = "PLACEHOLDER" as const;
export const PSP_PROFILE_ID = "hood-terps-arc54-first-proof";

export type GeneticsType = "INDICA" | "SATIVA" | "HYBRID" | typeof PLACEHOLDER;

export interface HoodTerpsProofRecord {
  entity: Arc54GameEntity;
  source: {
    entityId: string;
    dna: string;
    supplyCap: typeof SUPPLY_CAP;
    sourceRepo: typeof SOURCE_REPO;
  };
  creator: { entityId: string; productionPackageRef: string };
  hoodTerps: {
    dna: string;
    genetics: {
      type: GeneticsType;
      parentage: string[] | null;
      dominance: string | null;
    };
    traits: string[] | null;
    geometryReceipt: string;
    layerManifest: string[];
    compositionStandard: "SQUARE_LOCKED";
    outputContract: {
      width: 2048;
      height: 2048;
      rgba: true;
      noStretch: true;
      noCrop: true;
    };
    geometry: {
      rig: string | null;
      anchors: null;
      traitZones: null;
      protectedPolygons: null;
      smokeSplines: null;
    };
    validation: {
      geometryGate: string;
      handItemOcclusion: "REAR_FINGER_ITEM_FRONT_FINGER";
      imageDimensions: { width: 2048; height: 2048 };
      approvedLayerOnly: true;
    };
    handItemRule: {
      required: true;
      occlusionOrder: "REAR_FINGER_ITEM_FRONT_FINGER";
    };
  };
}

export const PROOF_RECORD: HoodTerpsProofRecord = {
  entity: PROOF_ENTITY,
  source: {
    entityId: PROOF_ENTITY_ID,
    dna: PLACEHOLDER,
    supplyCap: SUPPLY_CAP,
    sourceRepo: SOURCE_REPO,
  },
  creator: {
    entityId: PROOF_ENTITY_ID,
    productionPackageRef: PROOF_ENTITY.creator.productionPackageRef,
  },
  hoodTerps: {
    dna: PLACEHOLDER,
    genetics: {
      type: PLACEHOLDER,
      parentage: null,
      dominance: null,
    },
    traits: null,
    geometryReceipt: PLACEHOLDER,
    layerManifest: [],
    compositionStandard: "SQUARE_LOCKED",
    outputContract: {
      width: 2048,
      height: 2048,
      rgba: true,
      noStretch: true,
      noCrop: true,
    },
    geometry: {
      rig: PLACEHOLDER,
      anchors: null,
      traitZones: null,
      protectedPolygons: null,
      smokeSplines: null,
    },
    validation: {
      geometryGate: PLACEHOLDER,
      handItemOcclusion: "REAR_FINGER_ITEM_FRONT_FINGER",
      imageDimensions: { width: 2048, height: 2048 },
      approvedLayerOnly: true,
    },
    handItemRule: {
      required: true,
      occlusionOrder: "REAR_FINGER_ITEM_FRONT_FINGER",
    },
  },
};

export function holofoilSeedFromIdentity(entityId: string, dna: string): string {
  return `${entityId}+${dna}`;
}

export function hoodTerpsHolofoilBinding(record: HoodTerpsProofRecord = PROOF_RECORD): HoodTerpsHolofoilBinding {
  return {
    version: "1.0.0",
    entityId: record.entity.id,
    dna: record.hoodTerps.dna,
    material: {
      seedSource: "ENTITY_ID_AND_DNA",
      preset: "obsidian-foil",
      pointerTilt: true,
      inspectState: true,
      rewardReveal: true,
      packReveal: false,
    },
    provenance: {
      geometryReceipt: record.hoodTerps.geometryReceipt,
      sourceRepo: SOURCE_REPO,
    },
  };
}

export function arc54HolofoilBinding(record: HoodTerpsProofRecord = PROOF_RECORD): Arc54HolofoilBinding {
  const seed = holofoilSeedFromIdentity(record.entity.id, record.hoodTerps.dna);
  return {
    version: "1.0.0",
    entityId: record.entity.id,
    projectId: PROOF_PROJECT_ID,
    material: {
      id: record.entity.holofoil.materialId,
      seed,
      substrate: "obsidian",
      diffractionProfile: "obsidian-foil",
      reactiveTilt: true,
      reactivePointer: true,
    },
    presentation: {
      revealProfile: "reward-reveal",
      summonProfile: "card-to-proxy",
      rewardProfile: "reward-reveal",
    },
    provenance: {
      arc54EntityRef: record.entity.id,
      creatorAssetRefs: [record.creator.productionPackageRef],
    },
  };
}

export function identityChain(record: HoodTerpsProofRecord = PROOF_RECORD): Record<string, string> {
  return {
    source: record.source.entityId,
    creator: record.creator.entityId,
    arcana: record.entity.id,
    holofoil: record.entity.id,
    battle: record.entity.id,
    reward: record.entity.id,
    collection: record.entity.id,
  };
}

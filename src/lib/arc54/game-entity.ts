/** Mirrors ARCANA-54 `src/contracts/arc54-game-entity.ts` (commit 1590b055). */

export interface Arc54GameEntity {
  version: "1.0.0";
  id: string;
  projectId: string;
  identity: {
    name: string;
    faction?: string;
    class?: string;
    rarity?: string;
    loreRef?: string;
  };
  gameplay: {
    cost?: number;
    attack?: number;
    defense?: number;
    health?: number;
    abilities: string[];
    tags: string[];
  };
  creator: {
    productionPackageRef: string;
    imageAssetId?: string;
    modelAssetId?: string;
    animationAssetIds: string[];
    audioAssetIds: string[];
    vfxAssetIds: string[];
  };
  holofoil: {
    materialId: string;
    deterministicSeed: string;
    revealProfile?: string;
    summonProfile?: string;
  };
  progression: {
    unlockCondition?: string;
    rewardPool?: string;
  };
  provenance: {
    originContractRef: string;
    creatorReceiptRef: string;
    buildHash?: string;
  };
}

export function sameCanonicalEntity(a: Arc54GameEntity, b: Arc54GameEntity): boolean {
  return a.id === b.id && a.projectId === b.projectId;
}

export const PROOF_ENTITY_ID = "hood-terps:proof-001";
export const PROOF_PROJECT_ID = "hood-terps";

export const PROOF_ENTITY: Arc54GameEntity = {
  version: "1.0.0",
  id: PROOF_ENTITY_ID,
  projectId: PROOF_PROJECT_ID,
  identity: {
    name: "HOOD TERPS PROOF ENTITY",
    faction: "PLACEHOLDER",
    class: "collector",
    rarity: "proof",
    loreRef: "canon_status=PLACEHOLDER",
  },
  gameplay: {
    cost: 1,
    attack: 12,
    defense: 4,
    health: 12,
    abilities: ["STRIKE"],
    tags: ["proof", "fixture"],
  },
  creator: {
    productionPackageRef: "fixture://hood-terps/proof-001",
    imageAssetId: "placeholder-card",
    modelAssetId: "placeholder-proxy",
    animationAssetIds: ["idle", "strike"],
    audioAssetIds: [],
    vfxAssetIds: ["foil-reveal"],
  },
  holofoil: {
    materialId: "agentropolis.holofoil.material.v1:obsidian-foil",
    deterministicSeed: PROOF_ENTITY_ID,
    revealProfile: "reward-reveal",
    summonProfile: "card-to-proxy",
  },
  progression: {
    unlockCondition: "proof-encounter-win",
    rewardPool: "self",
  },
  provenance: {
    originContractRef: "docs/PLAYABLE-SLICE-PROTOCOL.md",
    creatorReceiptRef: "DATA SOURCE: FIXTURE",
    buildHash: "local-proof",
  },
};

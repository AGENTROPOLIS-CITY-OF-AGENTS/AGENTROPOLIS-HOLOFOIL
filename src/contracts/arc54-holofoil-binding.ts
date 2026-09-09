export interface Arc54HolofoilBinding {
  version: '1.0.0';
  entityId: string;
  projectId: string;
  material: {
    id: string;
    seed: string;
    substrate: 'obsidian' | 'metallic' | 'paper' | 'glass' | 'custom';
    diffractionProfile: string;
    grainProfile?: string;
    reactiveTilt: boolean;
    reactivePointer: boolean;
  };
  presentation: {
    cardFrame?: string;
    rarityFx?: string;
    revealProfile?: string;
    summonProfile?: string;
    rewardProfile?: string;
  };
  provenance: {
    arc54EntityRef: string;
    creatorAssetRefs: string[];
  };
}

export function materialKey(binding: Arc54HolofoilBinding): string {
  return [binding.projectId, binding.entityId, binding.material.id, binding.material.seed].join(':');
}

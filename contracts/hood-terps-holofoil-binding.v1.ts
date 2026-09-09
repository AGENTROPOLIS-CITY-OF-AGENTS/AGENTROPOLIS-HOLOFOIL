export interface HoodTerpsHolofoilBinding {
  version: '1.0.0';
  entityId: string;
  dna: string;
  material: {
    seedSource: 'ENTITY_ID_AND_DNA';
    preset: string;
    pointerTilt: boolean;
    inspectState: boolean;
    rewardReveal: boolean;
    packReveal?: boolean;
  };
  provenance: {
    geometryReceipt: string;
    sourceRepo: 'AGENTROPOLIS-CITY-OF-AGENTS/HOOD-TERPS';
  };
}

export function assertHoodTerpsHolofoilBinding(binding: HoodTerpsHolofoilBinding): void {
  if (!binding.entityId || !binding.dna) throw new Error('HOLOFOIL_HOOD_TERPS_IDENTITY_REQUIRED');
  if (binding.material.seedSource !== 'ENTITY_ID_AND_DNA') {
    throw new Error('HOLOFOIL_HOOD_TERPS_NONDETERMINISTIC_SEED');
  }
  if (!binding.provenance.geometryReceipt) throw new Error('HOLOFOIL_HOOD_TERPS_GEOMETRY_RECEIPT_REQUIRED');
}

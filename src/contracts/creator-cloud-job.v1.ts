export type CreatorCloudMode = 'EASY' | 'PRO' | 'AGENT';
export type CreatorCloudAction = 'COMPOSE' | 'GENERATE' | 'VALIDATE' | 'SIMULATE' | 'PUBLISH_REQUEST';

export interface TraitRule {
  trait: string;
  value?: string;
  lock?: boolean;
  excludeWith?: Array<{ trait: string; value: string }>;
  requireWith?: Array<{ trait: string; value: string }>;
}

export interface CreatorCloudJobV1 {
  version: '1.0.0';
  jobId: string;
  mode: CreatorCloudMode;
  action: CreatorCloudAction;
  project: {
    name: string;
    collectionType:
      | 'DIGITAL_ART'
      | 'TRADING_CARDS'
      | 'AVATAR_COLLECTION'
      | 'GAME_ITEMS'
      | 'MEMBERSHIP_PASS'
      | 'LIMITED_DROP'
      | 'UNDECIDED';
    requestedSupply: number;
  };
  source: {
    creatorRepo?: string;
    assetCatalogRef?: string;
    metadataCsvRef?: string;
  };
  composition: {
    uniqueRequired: boolean;
    randomize: boolean;
    rules: TraitRule[];
  };
  holofoil: {
    enabled: boolean;
    preset?: string;
  };
  publish?: {
    destination: 'WEB2_ONLY' | 'WEB3';
    chain?: string;
    priceDisplay?: string;
  };
  authority: {
    executionEnvelopeId?: string;
    humanApprovalRequired: boolean;
  };
}

export interface CreatorCloudReceiptV1 {
  version: '1.0.0';
  jobId: string;
  status: 'ACCEPTED' | 'VALIDATED' | 'SIMULATED' | 'BLOCKED' | 'READY_FOR_APPROVAL';
  outputs: {
    generatedCount?: number;
    duplicateCount?: number;
    metadataRef?: string;
    previewRef?: string;
    simulationRef?: string;
  };
  blockers: string[];
  approvalRequired: boolean;
}

export function assertCreatorCloudJob(job: CreatorCloudJobV1): void {
  if (job.version !== '1.0.0') throw new Error('HOLOFOIL_JOB_VERSION_UNSUPPORTED');
  if (!job.jobId || !job.project.name) throw new Error('HOLOFOIL_JOB_IDENTITY_REQUIRED');
  if (!Number.isInteger(job.project.requestedSupply) || job.project.requestedSupply < 1) {
    throw new Error('HOLOFOIL_JOB_SUPPLY_INVALID');
  }
  if (job.action === 'PUBLISH_REQUEST' && job.publish?.destination === 'WEB3') {
    if (!job.authority.executionEnvelopeId) throw new Error('HOLOFOIL_EXECUTION_ENVELOPE_REQUIRED');
    if (!job.authority.humanApprovalRequired) throw new Error('HOLOFOIL_PUBLISH_APPROVAL_GATE_REQUIRED');
  }
}

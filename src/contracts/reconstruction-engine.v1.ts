export const HOLOFOIL_RECONSTRUCTION_ENGINE_VERSION = "holofoil.reconstruction.v1" as const;

export type ReconstructionSourceClass =
  | "ORIGINAL_LAYER"
  | "FLATTENED_REFERENCE"
  | "COMPRESSED_REFERENCE"
  | "SCREENSHOT_REFERENCE"
  | "UNKNOWN_PROVENANCE";

export type ReconstructionMethod =
  | "DIRECT_LAYER_USE"
  | "SEGMENTATION_MATTING"
  | "LANDMARK_ALIGNMENT"
  | "SYMMETRY_COMPLETION"
  | "DEPTH_PRIOR_2_5D"
  | "PARAMETRIC_REDRAW"
  | "VECTOR_RECONSTRUCTION"
  | "PROCEDURAL_VARIANT_SYNTHESIS";

export type ReconstructionArtifactStatus =
  | "REFERENCE_ONLY"
  | "RECONSTRUCTED"
  | "QC_REQUIRED"
  | "APPROVED_FOR_TESTNET"
  | "BLOCKED";

export type ReconstructionEvidenceV1 = {
  sourceRef: string;
  sourceClass: ReconstructionSourceClass;
  sourceDigest: string;
  width: number;
  height: number;
  compressionSuspected: boolean;
  provenanceStatus: "VERIFIED" | "UNVERIFIED";
};

export type CanonicalGeometryV1 = {
  canvasWidth: number;
  canvasHeight: number;
  anchorX: number;
  anchorY: number;
  scale: number;
  poseId: string;
  landmarkModel: string;
};

export type ReconstructionQualityV1 = {
  silhouetteIoU?: number;
  landmarkRmsePx?: number;
  edgeChamferPx?: number;
  alphaBoundaryError?: number;
  perceptualDistance?: number;
  symmetryResidual?: number;
  occlusionRisk?: number;
  confidence: number;
};

export type ReconstructionLayerV1 = {
  version: typeof HOLOFOIL_RECONSTRUCTION_ENGINE_VERSION;
  artifactId: string;
  projectId: string;
  traitFamily: string;
  traitValue: string;
  evidence: ReconstructionEvidenceV1[];
  methods: ReconstructionMethod[];
  geometry: CanonicalGeometryV1;
  quality: ReconstructionQualityV1;
  status: ReconstructionArtifactStatus;
  humanApproved: boolean;
  notes?: string[];
};

export type ReconstructionJobV1 = {
  version: typeof HOLOFOIL_RECONSTRUCTION_ENGINE_VERSION;
  jobId: string;
  projectId: string;
  objective: "REBUILD_CANONICAL_LAYER_LIBRARY";
  sourcePolicy: "REFERENCE_DOES_NOT_EQUAL_MASTER";
  target: {
    collectionSize: number;
    testBatchSize: number;
    deterministicSeed: string;
  };
  constraints: {
    preserveIpOwnership: true;
    hiddenPixelsMustNotBeClaimedRecovered: true;
    noProductionMintFromUnverifiedReferences: true;
    duplicateDnaForbidden: true;
    artQcRequired: true;
  };
};

export function reconstructionLayerCanEnterTestnet(layer: ReconstructionLayerV1): boolean {
  const q = layer.quality;
  return (
    layer.humanApproved &&
    layer.status === "APPROVED_FOR_TESTNET" &&
    q.confidence >= 0.9 &&
    (q.occlusionRisk ?? 1) <= 0.2
  );
}

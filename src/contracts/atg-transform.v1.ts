/** Holofoil consumes ATG TRANSFORM IR. It does not vendor compiler or provider syntax. */
export const ATG_TRANSFORM_IR_VERSION = "atg.transform-ir.v1" as const;

export const ATG_EPISTEMIC = ["OBSERVED", "RECOVERED", "INFERRED", "SYNTHESIZED"] as const;
export type AtgEpistemic = (typeof ATG_EPISTEMIC)[number];

export const ATG_CONCEPTS = [
  "ENTITY",
  "STATE",
  "SPACE",
  "TIME",
  "RELATION",
  "ACTION",
  "MATERIAL",
  "FORCE",
  "CAMERA",
  "AGENT",
  "INTENT",
  "AUTHORITY",
  "EVIDENCE",
  "UNCERTAINTY",
  "TRANSFORMATION",
] as const;
export type AtgConcept = (typeof ATG_CONCEPTS)[number];

export type AtgApproval = "NONE" | "REQUIRED" | "APPROVED" | "REJECTED";

export interface AtgPropertyV1 {
  path: string;
  concept: AtgConcept;
  value: string;
  epistemic: AtgEpistemic;
  confidence: number;
  uncertainty?: { low?: number; high?: number; note?: string };
  evidenceRefs: string[];
  provenance: string;
  method: string;
  toolVersion: string;
  humanApproval: AtgApproval;
}

export interface AtgConstraintV1 {
  id: string;
  predicate: string;
  status: "PASS" | "FAIL" | "UNCHECKED";
  evidenceRefs: string[];
}

export interface AtgTransformIrV1 {
  version: typeof ATG_TRANSFORM_IR_VERSION;
  entityId: string;
  owner: string;
  properties: AtgPropertyV1[];
  constraints: AtgConstraintV1[];
  roundTrip?: {
    direction: "SPEC_TO_ASSET" | "ASSET_TO_STRUCTURE" | "ROUND_TRIP";
    compared: boolean;
    deltaNote?: string;
  };
}

export function assertEpistemicHonest(property: AtgPropertyV1): void {
  if (
    (property.epistemic === "INFERRED" || property.epistemic === "SYNTHESIZED") &&
    /original|recovered source|source master/i.test(property.value)
  ) {
    throw new Error("ATG_EPISTEMIC_RELABEL");
  }
}

export function isRecoveredSource(property: AtgPropertyV1): boolean {
  return property.epistemic === "OBSERVED" || property.epistemic === "RECOVERED";
}

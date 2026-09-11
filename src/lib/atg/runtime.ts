import {
  ATG_TRANSFORM_IR_VERSION,
  assertEpistemicHonest,
  type AtgPropertyV1,
  type AtgTransformIrV1,
} from "../../contracts/atg-transform.v1.ts";

export interface AtgCompileRequest {
  entityId: string;
  owner: string;
  sourceRefs: string[];
  observed?: Array<{ path: string; value: string }>;
  missingHidden?: Array<{ path: string; prior: string }>;
}

/** Narrow Holofoil → ATG Runtime seam. No provider-specific syntax. */
export function compileToIr(req: AtgCompileRequest): AtgTransformIrV1 {
  const properties: AtgPropertyV1[] = [];
  for (const item of req.observed ?? []) {
    const prop: AtgPropertyV1 = {
      path: item.path,
      concept: "EVIDENCE",
      value: item.value,
      epistemic: "OBSERVED",
      confidence: 0.8,
      evidenceRefs: req.sourceRefs,
      provenance: req.owner,
      method: "ATG.CLASSIFY",
      toolVersion: ATG_TRANSFORM_IR_VERSION,
      humanApproval: "NONE",
    };
    assertEpistemicHonest(prop);
    properties.push(prop);
  }
  for (const item of req.missingHidden ?? []) {
    const prop: AtgPropertyV1 = {
      path: item.path,
      concept: "TRANSFORMATION",
      value: item.prior,
      epistemic: "SYNTHESIZED",
      confidence: 0.35,
      uncertainty: { note: "Hidden pixels are reconstructed, not recovered." },
      evidenceRefs: req.sourceRefs,
      provenance: req.owner,
      method: "ATG.SYNTHESIZE",
      toolVersion: ATG_TRANSFORM_IR_VERSION,
      humanApproval: "REQUIRED",
    };
    assertEpistemicHonest(prop);
    properties.push(prop);
  }
  return {
    version: ATG_TRANSFORM_IR_VERSION,
    entityId: req.entityId,
    owner: req.owner,
    properties,
    constraints: [],
    roundTrip: { direction: "ASSET_TO_STRUCTURE", compared: false },
  };
}

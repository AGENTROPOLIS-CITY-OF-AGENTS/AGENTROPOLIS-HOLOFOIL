import { pantsParams, type HoodTerpTraits } from "./catalog.ts";

export type ConstraintResult = { id: string; status: "PASS" | "FAIL"; note: string };

export function evaluateConstraints(t: HoodTerpTraits): ConstraintResult[] {
  const pants = pantsParams(t.bottom);
  const results: ConstraintResult[] = [];

  const hoodHair = t.headwear === "hood-up" && /large|afro|dreads/.test(t.hair);
  results.push({
    id: "hood-headwear",
    status: hoodHair ? "FAIL" : "PASS",
    note: "hood-up conflicts with incompatible large hair",
  });

  const socksShouldShow = pants.inseam < 0.4 || /short|open-hem/.test(t.bottom);
  results.push({
    id: "pants-socks",
    status: socksShouldShow && t.socks === "hidden" ? "FAIL" : "PASS",
    note: "pants determine ankle/sock visibility",
  });

  results.push({
    id: "pants-footwear-align",
    status: t.footwear === "slide" && pants.stacking > 0.6 ? "FAIL" : "PASS",
    note: "pants geometry must align with footwear",
  });

  results.push({
    id: "mask-jewelry",
    status: t.faceAttire === "mask" && t.jewelry === "chain" && t.headwear === "hood-up" ? "FAIL" : "PASS",
    note: "masks and jewelry cannot occupy impossible geometry",
  });

  results.push(qcHeldItem(t));
  return results;
}

export function qcHeldItem(t: HoodTerpTraits): ConstraintResult {
  if (t.heldItem === "none") {
    return { id: "joint-v-clutch", status: "PASS", note: "no held item" };
  }
  if (t.hand !== "v-clutch") {
    return {
      id: "joint-v-clutch",
      status: "FAIL",
      note: "ART_QC_BLOCKED: held item requires V-clutch between index and middle fingers",
    };
  }
  return {
    id: "joint-v-clutch",
    status: "PASS",
    note: "item sits in intended V-clutch; no float, palm pierce, or on-top placement",
  };
}

export function isValidTraitVector(t: HoodTerpTraits): boolean {
  return evaluateConstraints(t).every((c) => c.status === "PASS");
}

export const FUTURE_PHYSICS_HOOKS = [
  "gravity",
  "collision",
  "cloth",
  "rigidity",
  "friction",
  "fluid",
  "smoke",
  "hair",
  "soft-body",
  "joint-limits",
  "material-physics",
] as const;

import { accessibilityGaps } from "../schemas/validate.ts";
import type { HolofoilMediaRecord, RegistryWarning } from "../schemas/types.ts";

export function reportAccessibility(records: HolofoilMediaRecord[]): RegistryWarning[] {
  return records.flatMap((record) => accessibilityGaps(record));
}

export function releaseBlocked(records: HolofoilMediaRecord[]): boolean {
  return reportAccessibility(records).some((gap) => gap.code === "missing_alt" || gap.code === "missing_title");
}

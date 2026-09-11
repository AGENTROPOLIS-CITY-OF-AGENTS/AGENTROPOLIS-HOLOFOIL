import type { ReconstructionSourceClass } from "../../contracts/reconstruction-engine.v1.ts";
import type { FileInventoryItemV1 } from "../../contracts/founder-intake.v1.ts";

export function classifyReference(file: FileInventoryItemV1): ReconstructionSourceClass {
  const name = file.filename.toLowerCase();
  if (file.rejectedReason) return "UNKNOWN_PROVENANCE";
  if (/screenshot|discord|download/.test(name)) return "SCREENSHOT_REFERENCE";
  if (file.ext === "jpg" || file.ext === "jpeg" || file.ext === "webp") return "COMPRESSED_REFERENCE";
  if (file.ext === "png" && /layer|alpha/.test(name)) return "ORIGINAL_LAYER";
  if (file.assetClass === "IMAGE") return "FLATTENED_REFERENCE";
  return "UNKNOWN_PROVENANCE";
}

export function reconstructionNeeded(files: FileInventoryItemV1[]): boolean {
  return files.some((f) => {
    const cls = classifyReference(f);
    return cls !== "ORIGINAL_LAYER" && f.assetClass === "IMAGE";
  });
}

import type { HolofoilMediaRecord, RegistryWarning } from "../schemas/types.ts";

const VIDEO_EXT = [".mp4", ".webm", ".m4v", ".mov"];
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export function detectDuplicates(paths: string[]): string[] {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const path of paths) {
    const key = path.trim().toLowerCase();
    if (seen.has(key)) dupes.push(path);
    else seen.add(key);
  }
  return dupes;
}

export function inferMediaFromPath(path: string): Pick<HolofoilMediaRecord, "source" | "mediaType" | "id"> | null {
  const name = path.split("/").pop() ?? path;
  const lower = name.toLowerCase();
  const id = name.replace(/\.[^.]+$/, "") || "media-untitled";
  if (VIDEO_EXT.some((ext) => lower.endsWith(ext))) {
    return { id, source: path, mediaType: "video" };
  }
  if (IMAGE_EXT.some((ext) => lower.endsWith(ext))) {
    return { id, source: path, mediaType: "image" };
  }
  if (lower.endsWith(".m3u8")) return { id, source: path, mediaType: "stream" };
  return null;
}

/** Build-time helper. Does not auto-approve. Filenames with spaces are preserved. */
export function ingestMediaFiles(paths: string[]): {
  drafts: HolofoilMediaRecord[];
  warnings: RegistryWarning[];
} {
  const warnings: RegistryWarning[] = [];
  for (const dupe of detectDuplicates(paths)) {
    warnings.push({ code: "duplicate_asset", message: `Duplicate asset path: ${dupe}` });
  }
  const drafts: HolofoilMediaRecord[] = [];
  for (const path of paths) {
    const inferred = inferMediaFromPath(path);
    if (!inferred) {
      warnings.push({ code: "skipped_file", message: `Unsupported media file: ${path}` });
      continue;
    }
    drafts.push({
      ...inferred,
      rights: { approved: false },
      moderationStatus: "pending",
      provenance: { source: path },
    });
  }
  return { drafts, warnings };
}

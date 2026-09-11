import type { AssetClass, FileInventoryItemV1, ProjectFactV1 } from "../../contracts/founder-intake.v1.ts";

export interface IntakeFile {
  name: string;
  size: number;
  type?: string;
  text?: string;
}

const BLOCKED = new Set([
  "exe", "bat", "cmd", "com", "scr", "dll", "so", "dylib", "app", "apk", "msi", "sh", "ps1", "jar",
]);

const CLASS_BY_EXT: Record<string, AssetClass> = {
  zip: "ARCHIVE",
  pdf: "DOCUMENT",
  doc: "DOCUMENT",
  docx: "DOCUMENT",
  ppt: "DECK",
  pptx: "DECK",
  csv: "SPREADSHEET",
  xlsx: "SPREADSHEET",
  json: "METADATA",
  png: "IMAGE",
  jpg: "IMAGE",
  jpeg: "IMAGE",
  webp: "IMAGE",
  gif: "IMAGE",
  svg: "IMAGE",
  mp4: "VIDEO",
  webm: "VIDEO",
  mov: "VIDEO",
  mp3: "AUDIO",
  wav: "AUDIO",
  glb: "MODEL_3D",
  gltf: "MODEL_3D",
  obj: "MODEL_3D",
  fbx: "MODEL_3D",
  txt: "LORE",
  md: "LORE",
};

const MAX_BYTES = 40 * 1024 * 1024;

function extOf(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? name;
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot + 1).toLowerCase() : "";
}

export function classifyFile(file: IntakeFile): FileInventoryItemV1 {
  const ext = extOf(file.name);
  const id = `file-${file.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  if (BLOCKED.has(ext) || file.name.includes("..") || file.name.startsWith("/")) {
    return {
      id,
      filename: file.name,
      ext,
      bytes: file.size,
      mime: file.type ?? "",
      assetClass: "REJECTED",
      status: "UNVERIFIED",
      rejectedReason: "Unsafe path or executable is not accepted by the ingest membrane.",
    };
  }
  if (file.size > MAX_BYTES) {
    return {
      id,
      filename: file.name,
      ext,
      bytes: file.size,
      mime: file.type ?? "",
      assetClass: "REJECTED",
      status: "UNVERIFIED",
      rejectedReason: "File exceeds 40MB intake policy.",
    };
  }
  let assetClass = CLASS_BY_EXT[ext] ?? "UNKNOWN";
  const lower = file.name.toLowerCase();
  if (/brand|logo|kit/.test(lower) && assetClass === "IMAGE") assetClass = "BRAND";
  if (/contract|agreement|license/.test(lower)) assetClass = "CONTRACT";
  return {
    id,
    filename: file.name,
    ext,
    bytes: file.size,
    mime: file.type ?? "",
    assetClass,
    status: "FOUND",
  };
}

function fact(
  key: string,
  value: string,
  sourceRef: string,
  ownership: ProjectFactV1["ownership"],
  status: ProjectFactV1["status"] = "FOUND",
): ProjectFactV1 {
  return {
    id: `fact-${key}-${sourceRef}`,
    key,
    value,
    status,
    sourceRef,
    sourceKind: "UPLOAD",
    confidence: status === "FOUND" ? 0.6 : 0.3,
    ownership,
    updatedAt: "1970-01-01T00:00:00.000Z",
  };
}

export function extractFactsFromFile(file: IntakeFile): ProjectFactV1[] {
  const inventory = classifyFile(file);
  if (inventory.assetClass === "REJECTED") return [];
  const facts: ProjectFactV1[] = [];
  const name = file.name.toLowerCase();

  const supplyInName = name.match(/(\d{2,5})(?:[-_]piece|[-_]supply)/);
  if (supplyInName) facts.push(fact("supply", supplyInName[1], file.name, "REVIEW"));

  if (inventory.assetClass === "IMAGE" || inventory.assetClass === "BRAND") {
    facts.push(fact("artwork", "FOUND", file.name, "AUTO"));
  }
  if (inventory.assetClass === "BRAND") facts.push(fact("brand", "FOUND", file.name, "AUTO"));
  if (inventory.assetClass === "DECK") facts.push(fact("pitch", "FOUND", file.name, "AUTO"));
  if (inventory.assetClass === "CONTRACT") facts.push(fact("rightsDocument", "FOUND", file.name, "FOUNDER_ONLY"));
  if (name.includes("trait")) facts.push(fact("traits", "FOUND", file.name, "REVIEW"));
  if (name.includes("rule")) facts.push(fact("game", "FOUND", file.name, "REVIEW"));

  if (file.text) {
    const supplyField =
      file.text.match(/supply["'\s,:=]+(\d{2,5})/i) ||
      file.text.match(/"?(?:collectionSize|size)"?\s*[:=]\s*"?(\d{2,5})/i);
    if (supplyField) facts.push(fact("supply", supplyField[1], file.name, "REVIEW"));
    const title = file.text.match(/"name"\s*:\s*"([^"]{2,80})"/);
    if (title) facts.push(fact("name", title[1], file.name, "REVIEW"));
  }
  return facts;
}

export function detectConflicts(facts: ProjectFactV1[]): ProjectFactV1[] {
  const groups = new Map<string, ProjectFactV1[]>();
  for (const item of facts) {
    if (item.status === "MISSING") continue;
    const list = groups.get(item.key) ?? [];
    list.push(item);
    groups.set(item.key, list);
  }
  const next: ProjectFactV1[] = [];
  for (const [key, list] of groups) {
    const values = new Set(list.map((f) => f.value));
    if (values.size > 1 && list.length > 1) {
      for (const item of list) {
        next.push({
          ...item,
          status: "CONFLICT",
          confidence: 0,
          id: `${item.id}-conflict`,
        });
      }
      next.push({
        id: `conflict-${key}`,
        key,
        value: `CONFLICT: ${[...values].join(" vs ")}`,
        status: "CONFLICT",
        sourceRef: list.map((f) => f.sourceRef).join(" · "),
        sourceKind: "SYSTEM",
        confidence: 0,
        ownership: "FOUNDER_ONLY",
        updatedAt: "1970-01-01T00:00:00.000Z",
      });
    } else {
      next.push(...list);
    }
  }
  const leftovers = facts.filter((f) => f.status === "MISSING");
  return [...next, ...leftovers];
}

export function ingestFiles(files: IntakeFile[]): {
  inventory: FileInventoryItemV1[];
  facts: ProjectFactV1[];
} {
  const inventory = files.map(classifyFile);
  const extracted = files.flatMap(extractFactsFromFile);
  return { inventory, facts: detectConflicts(extracted) };
}

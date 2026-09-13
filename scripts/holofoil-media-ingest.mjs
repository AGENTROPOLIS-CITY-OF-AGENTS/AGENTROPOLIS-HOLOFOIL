#!/usr/bin/env node
/**
 * Build-time Holofoil media ingest.
 *
 * Usage:
 *   node scripts/holofoil-media-ingest.mjs [directory]
 *
 * Scans a directory for video/image files and writes a DRAFT manifest.
 * Drafts are never auto-approved. The consuming app must add rights,
 * alt text, and `rights.approved: true` before public render.
 */
import { readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const dir = process.argv[2] ?? join(process.cwd(), "public/media");
const VIDEO = /\.(mp4|webm|m4v|mov|m3u8)$/i;
const IMAGE = /\.(jpg|jpeg|png|webp|gif)$/i;

function walk(root, acc = []) {
  let entries = [];
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const files = walk(dir);
const drafts = [];
for (const file of files) {
  if (!VIDEO.test(file) && !IMAGE.test(file)) continue;
  const rel = relative(process.cwd(), file).split("\\").join("/");
  drafts.push({
    id: file.split(/[\\/]/).pop()?.replace(/\.[^.]+$/, ""),
    source: `/${rel.replace(/^public\//, "")}`,
    mediaType: IMAGE.test(file) ? "image" : VIDEO.test(file) && file.toLowerCase().endsWith(".m3u8") ? "stream" : "video",
    rights: { approved: false },
    moderationStatus: "pending",
    provenance: { source: rel },
  });
}

const out = join(process.cwd(), "src/data/media-surfaces/generated.draft.json");
writeFileSync(out, `${JSON.stringify({ version: "holofoil.media-manifest.v1", drafts }, null, 2)}\n`);
console.log(`Wrote ${drafts.length} draft records to ${out}`);

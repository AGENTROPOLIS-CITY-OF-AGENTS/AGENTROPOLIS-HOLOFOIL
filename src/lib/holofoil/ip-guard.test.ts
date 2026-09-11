import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import test from "node:test";
import { CAMPUS_BUILDINGS } from "./campus.ts";
import { findBannedIp } from "./ip-guard.ts";
import { NAV_ITEMS } from "./nav.ts";

const ROOT = join(import.meta.dirname, "../../..");
const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".git",
  ".output",
  ".nitro",
  ".vercel",
  ".tanstack",
  ".grok",
  "artifacts",
  "attachments",
  "screenshots",
]);
const SKIP_FILES = new Set(["package-lock.json"]);
const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".css",
  ".json",
  ".md",
  ".html",
  ".svg",
  ".sh",
]);

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name) || SKIP_FILES.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (TEXT_EXT.has(extname(name)) || name === "README") acc.push(full);
  }
  return acc;
}

test("removed-IP guard finds banned terms in sample text", () => {
  const hits = findBannedIp("Doginal Dogs on Dogecoin with Kabosu");
  assert.equal(hits.length > 0, true);
});

test("source tree contains no banned IP", () => {
  const files = walk(ROOT);
  const offenders: string[] = [];
  for (const file of files) {
    const name = basename(file);
    if (name === "ip-guard.test.ts" || name === "ip-guard.ts") continue;
    const text = readFileSync(file, "utf8");
    const hits = findBannedIp(text);
    if (hits.length) offenders.push(`${file}: ${hits.join(", ")}`);
  }
  assert.deepEqual(offenders, []);
});

test("campus buildings route into the navigation table", () => {
  const paths = new Set(NAV_ITEMS.map((item) => item.to));
  for (const building of CAMPUS_BUILDINGS) {
    assert.equal(paths.has(building.to), true, building.id);
  }
});

test("navigation routing table is complete", () => {
  const paths = NAV_ITEMS.map((item) => item.to);
  assert.deepEqual(paths, [
    "/builder",
    "/",
    "/lab",
    "/studio",
    "/dex",
    "/stage",
    "/storyboard",
    "/sdk",
  ]);
});

import { globSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const extra = process.argv.slice(2).filter((arg) => arg !== "--run");

function run(args, options = {}) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit", ...options });
  if (result.status) process.exit(result.status ?? 1);
}

const allScriptTests = globSync("scripts/**/*.test.mjs");
const grokPwaTests = allScriptTests
  .filter((file) => file.includes("grok-pwa"))
  .map((file) => resolve(file));
const otherScriptTests = allScriptTests.filter((file) => !file.includes("grok-pwa"));
const appTests = globSync("src/lib/**/*.test.ts");

if (otherScriptTests.length) {
  run(["--test", ...otherScriptTests, ...extra]);
}

if (grokPwaTests.length) {
  // Isolate from workspace site.json so snapshotOgIdentity(process.cwd())
  // cannot override document titles in the platform PWA injector tests.
  const isolated = mkdtempSync(join(tmpdir(), "grok-pwa-cwd-"));
  run(["--test", ...grokPwaTests, ...extra], { cwd: isolated });
}

if (appTests.length) {
  run(["--experimental-strip-types", "--test", ...appTests, ...extra]);
}

#!/usr/bin/env node
/**
 * OFFLINE testnet NFT canary harness for a single Robinhood Chain Testnet mint.
 *
 * This script NEVER performs a real mint, deploy, wallet signing, or network
 * call. It is a dry-run harness: it validates the canary config against the
 * existing Holofoil mint contract types (src/contracts/mint.v1.ts) and the
 * genesis recipe (src/contracts/hood-terps-genesis-033.v1.ts, TESTNET,
 * productionMint=false), then prints the exact steps a real canary would take.
 *
 * FAIL-CLOSED: the canary is BLOCKED until a testnet deployer key is provided
 * via the environment variable named in the config (HOLOFOIL_TESTNET_DEPLOYER_KEY).
 * The key is read from the environment only and is NEVER written to a file.
 * If the env var is absent, or the config is invalid, the script exits non-zero.
 *
 * Usage:
 *   node scripts/testnet-canary.mjs            # dry-run, no env var -> BLOCKED, exit 1
 *   HOLOFOIL_TESTNET_DEPLOYER_KEY=... node scripts/testnet-canary.mjs   # dry-run, READY, exit 0
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { assertMintRequest } from "../src/contracts/mint.v1.ts";
import { HOOD_TERPS_GENESIS_033 } from "../src/contracts/hood-terps-genesis-033.v1.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const CONFIG_PATH = join(PROJECT_ROOT, "config", "holofoil-testnet-canary.json");

/** The exact steps a real canary would take, in order. */
const CANARY_STEPS = [
  "prepare",
  "simulate",
  "sign",
  "submit",
  "confirm",
  "ingest receipt",
];

function fail(message) {
  console.error(`[testnet-canary] FAIL-CLOSED: ${message}`);
  process.exit(1);
}

async function loadConfig() {
  let raw;
  try {
    raw = await readFile(CONFIG_PATH, "utf8");
  } catch (err) {
    fail(`could not read config at ${CONFIG_PATH}: ${err.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    fail(`config is not valid JSON: ${err.message}`);
  }
  const cfg = parsed?.canary;
  if (!cfg || typeof cfg !== "object") {
    fail("config missing top-level 'canary' object");
  }
  return cfg;
}

/**
 * Validate the canary config against the mint contract types and the genesis
 * recipe. Throws on any mismatch; the caller converts to a fail-closed exit.
 */
function validateConfig(cfg) {
  const recipe = HOOD_TERPS_GENESIS_033;

  // (1) Validate against the mint contract request type (mint.v1.ts).
  assertMintRequest({
    version: "1.0.0",
    projectId: cfg.projectId,
    collectionId: cfg.collectionId,
    quantity: cfg.quantity,
    recipient: cfg.recipient,
    chainId: String(cfg.chain.chainId),
  });

  // (2) Validate against the genesis recipe (hood-terps-genesis-033.v1.ts).
  if (cfg.recipe !== recipe.version) {
    throw new Error(`recipe mismatch: config '${cfg.recipe}' !== recipe '${recipe.version}'`);
  }
  if (cfg.environment !== recipe.environment) {
    throw new Error(`environment mismatch: config '${cfg.environment}' !== recipe '${recipe.environment}'`);
  }
  if (cfg.chain.chainId !== recipe.chain.chainId) {
    throw new Error(`chainId mismatch: config ${cfg.chain.chainId} !== recipe ${recipe.chain.chainId}`);
  }
  if (cfg.chain.name !== recipe.chain.name) {
    throw new Error(`chain name mismatch: config '${cfg.chain.name}' !== recipe '${recipe.chain.name}'`);
  }
  if (cfg.productionMint !== recipe.authority.productionMint) {
    throw new Error(`productionMint mismatch: config ${cfg.productionMint} !== recipe ${recipe.authority.productionMint}`);
  }
  if (recipe.authority.productionMint !== false) {
    throw new Error("recipe grants production mint authority; canary refuses to proceed");
  }
  if (recipe.authority.walletSigning !== false) {
    throw new Error("recipe enables wallet signing; canary refuses to proceed");
  }
  if (cfg.quantity < 1 || cfg.quantity > recipe.collectionSize) {
    throw new Error(`quantity ${cfg.quantity} outside [1, collectionSize ${recipe.collectionSize}]`);
  }
  if (!cfg.deployerKeyEnvVar) {
    throw new Error("deployerKeyEnvVar is not set in config");
  }
}

function printDryRun(cfg, deployerKeyPresent) {
  const line = "=".repeat(64);
  console.log(line);
  console.log("HOLOFOIL TESTNET CANARY — DRY RUN (no real on-chain action)");
  console.log(line);
  console.log(`  environment : ${cfg.environment}`);
  console.log(`  chain       : ${cfg.chain.name} (chainId ${cfg.chain.chainId})`);
  console.log(`  projectId   : ${cfg.projectId}`);
  console.log(`  collectionId: ${cfg.collectionId}`);
  console.log(`  quantity    : ${cfg.quantity}`);
  console.log(`  recipient   : ${cfg.recipient}`);
  console.log(`  contract    : ${cfg.contract}`);
  console.log(`  gasEstimate : ${cfg.gasEstimate}`);
  console.log(`  recipe      : ${cfg.recipe} (productionMint=${cfg.productionMint})`);
  console.log(
    `  deployerKey : ${cfg.deployerKeyEnvVar} ${
      deployerKeyPresent ? "PRESENT (env only, never written to file)" : "ABSENT"
    }`,
  );
  console.log(line);
  console.log("Exact steps a real canary would take:");
  CANARY_STEPS.forEach((step, i) => {
    const status = deployerKeyPresent ? "READY " : "BLOCKED";
    console.log(`  [${i + 1}] ${status}  ${step}`);
  });
  console.log(line);
  if (deployerKeyPresent) {
    console.log(
      "  VERDICT: canary is READY to run, but this was a DRY RUN — no mint, deploy, sign, or network call was performed.",
    );
  } else {
    console.log("  VERDICT: canary is BLOCKED. Provide the testnet deployer key via the environment variable");
    console.log(`           ${cfg.deployerKeyEnvVar} (never written to a file) to unblock.`);
  }
  console.log(line);
}

const cfg = await loadConfig();
try {
  validateConfig(cfg);
} catch (err) {
  fail(`config invalid: ${err.message}`);
}

const deployerKey = process.env[cfg.deployerKeyEnvVar];
const deployerKeyPresent = Boolean(deployerKey && deployerKey.trim().length > 0);

printDryRun(cfg, deployerKeyPresent);

if (!deployerKeyPresent) {
  fail(
    `testnet deployer key env var '${cfg.deployerKeyEnvVar}' is absent. ` +
      "Canary is BLOCKED. No real mint can proceed without a testnet deployer key.",
  );
}

process.exit(0);

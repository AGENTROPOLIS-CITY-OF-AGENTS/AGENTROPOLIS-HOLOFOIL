import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSolo404Envelope,
  defaultSolo404Envelope,
  validateSolo404Envelope,
} from "./solo-404-envelope.ts";

test("default 404 SoloPreneur envelope is internally consistent", () => {
  const env = defaultSolo404Envelope("0xSoloFounder");
  assert.equal(env.noExternalDebt, true);
  assert.ok(env.annualRevenueUsd >= env.annualCostUsd, "revenue must be >= cost");
  assert.equal(env.annualRevenueUsd, 185_000);
  assert.equal(env.annualCostUsd, 30_000);
  assert.equal(env.netAnnualUsd, 155_000);
  const royaltyTotal = env.royaltySplit.founder + env.royaltySplit.treasury + env.royaltySplit.community;
  assert.equal(royaltyTotal, 100);
  assert.equal(validateSolo404Envelope(env).ok, true);
});

test("envelope rejects negative values", () => {
  const env = buildSolo404Envelope({
    founder: "0xSoloFounder",
    revenueStreams: [{ id: "mint", label: "Mint", annualUsd: -5, recurring: false }],
    costEnvelope: [{ id: "ops", label: "Ops", annualUsd: 10 }],
    royaltySplit: { founder: 60, treasury: 25, community: 15 },
    treasuryCapUsd: 100,
  });
  const result = validateSolo404Envelope(env);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("negative")));
});

test("envelope rejects royalty split that does not sum to 100", () => {
  const env = buildSolo404Envelope({
    founder: "0xSoloFounder",
    revenueStreams: [{ id: "mint", label: "Mint", annualUsd: 100, recurring: false }],
    costEnvelope: [{ id: "ops", label: "Ops", annualUsd: 10 }],
    royaltySplit: { founder: 50, treasury: 20, community: 10 },
    treasuryCapUsd: 100,
  });
  const result = validateSolo404Envelope(env);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("sum to 100")));
});

test("envelope rejects royalty share over 100%", () => {
  const env = buildSolo404Envelope({
    founder: "0xSoloFounder",
    revenueStreams: [{ id: "mint", label: "Mint", annualUsd: 100, recurring: false }],
    costEnvelope: [{ id: "ops", label: "Ops", annualUsd: 10 }],
    royaltySplit: { founder: 120, treasury: -20, community: 0 },
    treasuryCapUsd: 100,
  });
  const result = validateSolo404Envelope(env);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("<= 100")));
});

test("envelope rejects structurally loss-making model (revenue < cost)", () => {
  const env = buildSolo404Envelope({
    founder: "0xSoloFounder",
    revenueStreams: [{ id: "mint", label: "Mint", annualUsd: 50, recurring: false }],
    costEnvelope: [{ id: "ops", label: "Ops", annualUsd: 200 }],
    royaltySplit: { founder: 60, treasury: 25, community: 15 },
    treasuryCapUsd: 100,
  });
  const result = validateSolo404Envelope(env);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("revenue must be >= cost")));
});

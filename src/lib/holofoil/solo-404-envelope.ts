/**
 * "404 SoloPreneur" economic envelope.
 *
 * A typed, pure-data description of a solo-founder economic model:
 * revenue streams, cost envelope, royalty split, treasury cap, and a
 * hard "no external debt" invariant. Validation asserts internal
 * consistency: revenue >= cost, royalty split sums to 100% with each
 * share in [0, 100], and no negative values anywhere.
 */

export interface RevenueStream {
  id: string;
  label: string;
  annualUsd: number;
  recurring: boolean;
}

export interface CostLine {
  id: string;
  label: string;
  annualUsd: number;
}

export interface RoyaltySplit {
  founder: number; // percent
  treasury: number; // percent
  community: number; // percent
}

export interface Solo404Envelope {
  version: string;
  founder: string;
  revenueStreams: RevenueStream[];
  costEnvelope: CostLine[];
  royaltySplit: RoyaltySplit;
  treasuryCapUsd: number;
  noExternalDebt: true;
  annualRevenueUsd: number;
  annualCostUsd: number;
  netAnnualUsd: number;
}

export const SOLO_404_ENVELOPE_VERSION = "holofoil.solo-404.envelope.v1" as const;

export interface BuildSolo404EnvelopeInput {
  founder: string;
  revenueStreams: RevenueStream[];
  costEnvelope: CostLine[];
  royaltySplit: RoyaltySplit;
  treasuryCapUsd: number;
}

/** Build a Solo404Envelope, computing derived annual totals. */
export function buildSolo404Envelope(input: BuildSolo404EnvelopeInput): Solo404Envelope {
  const annualRevenueUsd = input.revenueStreams.reduce((sum, s) => sum + s.annualUsd, 0);
  const annualCostUsd = input.costEnvelope.reduce((sum, c) => sum + c.annualUsd, 0);
  return {
    version: SOLO_404_ENVELOPE_VERSION,
    founder: input.founder,
    revenueStreams: input.revenueStreams,
    costEnvelope: input.costEnvelope,
    royaltySplit: input.royaltySplit,
    treasuryCapUsd: input.treasuryCapUsd,
    noExternalDebt: true,
    annualRevenueUsd,
    annualCostUsd,
    netAnnualUsd: annualRevenueUsd - annualCostUsd,
  };
}

export interface EnvelopeValidation {
  ok: boolean;
  errors: string[];
}

/** Validate internal consistency of a Solo404Envelope. */
export function validateSolo404Envelope(env: Solo404Envelope): EnvelopeValidation {
  const errors: string[] = [];

  if (env.noExternalDebt !== true) errors.push("noExternalDebt must be true");

  if (env.annualRevenueUsd < 0) errors.push("annualRevenueUsd must be non-negative");
  if (env.annualCostUsd < 0) errors.push("annualCostUsd must be non-negative");
  if (env.treasuryCapUsd < 0) errors.push("treasuryCapUsd must be non-negative");

  for (const s of env.revenueStreams) {
    if (s.annualUsd < 0) errors.push(`revenue stream '${s.id}' has negative value`);
  }
  for (const c of env.costEnvelope) {
    if (c.annualUsd < 0) errors.push(`cost line '${c.id}' has negative value`);
  }

  const { founder, treasury, community } = env.royaltySplit;
  if (founder < 0 || treasury < 0 || community < 0) errors.push("royalty shares must be non-negative");
  if (founder > 100 || treasury > 100 || community > 100) errors.push("royalty shares must be <= 100");
  const royaltyTotal = founder + treasury + community;
  if (royaltyTotal !== 100) errors.push(`royalty split must sum to 100 (got ${royaltyTotal})`);

  if (env.annualRevenueUsd < env.annualCostUsd) {
    errors.push("revenue must be >= cost (envelope must not be structurally loss-making)");
  }

  return { ok: errors.length === 0, errors };
}

/** A sensible default solo-founder envelope for the 404 SoloPreneur model. */
export function defaultSolo404Envelope(founder: string): Solo404Envelope {
  return buildSolo404Envelope({
    founder,
    revenueStreams: [
      { id: "mint-primary", label: "Primary mint sales", annualUsd: 120_000, recurring: false },
      { id: "royalties-secondary", label: "Secondary market royalties", annualUsd: 40_000, recurring: true },
      { id: "merch", label: "Merch / licensing", annualUsd: 25_000, recurring: true },
    ],
    costEnvelope: [
      { id: "tools", label: "Tooling & infra", annualUsd: 12_000 },
      { id: "ops", label: "Ops & legal", annualUsd: 8_000 },
      { id: "marketing", label: "Marketing", annualUsd: 10_000 },
    ],
    royaltySplit: { founder: 60, treasury: 25, community: 15 },
    treasuryCapUsd: 500_000,
  });
}

# DECISIONS

## DECISION
HOOD TERPS proof runs in AGENTROPOLIS-HOLOFOIL with an ARCANA fixture adapter.

OWNER: Holofoil presentation; ARCANA fixture decides combat/collection.
SOURCE: ARCANA-54 `src/contracts/arc54-game-entity.ts` + Holofoil docs on main.
WHY: ARCANA-54 has the identity contract and no executable runtime. GitHub Pages proof cannot depend on a live ARCANA backend. Prompt allows deterministic local fixture adapters marked DATA SOURCE: FIXTURE.
DATE: 2026-09-09
INVALIDATE_IF: ARCANA-54 ships a portable browser runtime that accepts the same entity id.

## DECISION
Canonical entity id is `hood-terps-proof-001` (Gaming District fixture). DNA/genetics/traits/geometry coordinates remain PLACEHOLDER until HOOD TERPS exports a specific source record.

OWNER: Shared identity.
SOURCE: AGENTROPOLIS-GAMING-DISTRICT/fixtures/hood-terps/vertical-slice.v1.json + HOOD-TERPS README/export (no per-entity DNA in repo).
WHY: Do not invent DNA, parentage, dominance, traits, or stats.
DATE: 2026-09-09
INVALIDATE_IF: HOOD-TERPS publishes a source DNA record for this entity.

## DECISION
Origin HOOD TERPS PSP profile exists and is bound. Origin runtime is CONTRACT-ONLY.

OWNER: Origin Engine.
SOURCE: AGENTROPOLIS-UTILITY-GRID/utilities/origin-engine/contracts/hood-terps-psp-profile.v1.json
WHY: Profile found; no executable instantiate/verify in this slice.
DATE: 2026-09-09
INVALIDATE_IF: Origin ships a portable browser runtime for this profile.


## DECISION
Wallet, mint, payments stay OFF for this slice.

OWNER: Fiscal boundary.
SOURCE: Implementation prompt FINANCIAL BOUNDARY.
WHY: PSP MOCK/free slice.
DATE: 2026-09-09
INVALIDATE_IF: Separate approved mandate enables them.

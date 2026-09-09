# DECISIONS

## DECISION
HOOD TERPS proof runs in AGENTROPOLIS-HOLOFOIL with an ARCANA fixture adapter.

OWNER: Holofoil presentation; ARCANA fixture decides combat/collection.
SOURCE: ARCANA-54 `src/contracts/arc54-game-entity.ts` + Holofoil docs on main.
WHY: ARCANA-54 has the identity contract and no executable runtime. GitHub Pages proof cannot depend on a live ARCANA backend. Prompt allows deterministic local fixture adapters marked DATA SOURCE: FIXTURE.
DATE: 2026-09-09
INVALIDATE_IF: ARCANA-54 ships a portable browser runtime that accepts the same entity id.

## DECISION
Canonical entity id is `hood-terps:proof-001` with `canon_status = PLACEHOLDER`.

OWNER: Shared identity.
SOURCE: Implementation prompt; no HOOD TERPS canon retrieved.
WHY: Do not invent lore.
DATE: 2026-09-09
INVALIDATE_IF: Dock/Origin provides an authorized HOOD TERPS entity id.

## DECISION
Wallet, mint, payments stay OFF for this slice.

OWNER: Fiscal boundary.
SOURCE: Implementation prompt FINANCIAL BOUNDARY.
WHY: PSP MOCK/free slice.
DATE: 2026-09-09
INVALIDATE_IF: Separate approved mandate enables them.

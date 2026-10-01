# HOLOFOIL Game Adoption Roadmap

Status: ACTIVE IMPLEMENTATION PLAN

## Goal

Apply the Evergreen Game Integration Protocol across the Gaming District without copying BLOCKBANGERS-specific mechanics into other games.

## Wave 0 — Reference implementation

### BLOCKBANGERS
Role: reference implementation for the evergreen evidence and production-gate pattern.

Current state:
- Robinhood Chain game-lane title
- ARCANA-54 compatibility: COMPATIBLE_WITH_ADAPTER
- deterministic mirrored simulation evidence exists
- adversarial/economy boundaries passed
- production remains DARK
- fairness retest required
- independent VERITY review pending

Promotion requirement:
- first-player fairness threshold passes
- independent VERITY passes
- canonical promotion receipt
- DARK -> CANARY -> VERIFIED_CANARY -> PRODUCTION

## Wave 1 — Robinhood Chain TCG adoption

### HOOD TERPS TCG

Repository:
`AGENTROPOLIS-CITY-OF-AGENTS/HOOD-TERPS`

Observed readiness:
- live MOCK street + Cultivar Clash client
- TCG engine loads at /play
- Quick Clash v0.1 rules exist
- wallet/mint/payment remain disabled
- existing HOLOFOIL proof/binding infrastructure exists

Next:
1. create Evergreen Game Integration Manifest
2. bind canonical HOOD TERPS entity identity
3. confirm authoritative rules source
4. declare TCG-specific balance/evidence thresholds
5. run deterministic/adversarial evidence
6. independent VERITY
7. DARK -> CANARY -> VERIFIED_CANARY -> PRODUCTION

### PENGUIN ARCADE TCG

Repository:
`wiredchaos/penguinarcade`

Observed readiness:
- native TCG engine exists
- append-only TCGEventLedger exists
- CardRegistry is token-agnostic
- validatePlay gate exists
- deck/collection/reveal surfaces exist
- test suite includes TCG engine tests
- Robinhood Chain lane assignment is canonical in Gaming District
- repository binding to the chain lane remains pending

Next:
1. create Evergreen Game Integration Manifest
2. bind Penguin card identity into AGENTIC-ENTITY continuity
3. define authoritative gameplay source from the native TCG engine
4. connect HOLOFOIL presentation without replacing the native rules engine
5. declare Penguin-specific fairness/exploit metrics
6. verify Robinhood Chain repo binding separately
7. independent VERITY
8. staged promotion

## Wave 2 — ARC agentic game adoption

The Gaming District currently classifies these as ARC agentic-game candidates:

- BoardForge Arena
- C0 Intel Protocol
- GXAF

For each candidate:

1. verify game repository/current implementation
2. declare AGENTIC-ENTITY profile(s)
3. declare game authority and protected state
4. bind HOLOFOIL only where collectible/presentation surfaces exist
5. define agentic-game evidence metrics
6. test human/agent fairness and tool-access parity
7. verify deterministic/server-authoritative adjudication
8. verify AGENTROPOLIS-ARC is settlement/execution adapter only
9. testnet/devnet verification
10. independent VERITY
11. governance promotion from candidate to canonical ARC assignment

## Required agentic-game metrics

At minimum evaluate:
- agent vs human win-rate or task-success parity where relevant
- tool-access parity
- model/runtime class disclosure
- action-budget parity
- hidden-state leakage
- protected-state mutation attempts
- deterministic adjudication
- receipt completeness
- settlement authorization
- replay/recovery behavior

## Wave 3 — portfolio rollout

After Wave 1 and the first ARC reference game pass:

Use the same protocol for every registered Gaming District title that consumes HOLOFOIL.

No game is automatically production-ready because another game passed.

Every game supplies:
- its own authority map
- its own identity binding
- its own evidence metrics
- its own VERITY result
- its own promotion receipts

## Platform law

`SHARED PROCESS != SHARED GAMEPLAY`

HOLOFOIL standardizes integration, evidence, presentation, and promotion.

It does not standardize all games into one ruleset.

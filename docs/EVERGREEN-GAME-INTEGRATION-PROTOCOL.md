# HOLOFOIL Evergreen Game Integration Protocol v1

Status: CANONICAL INTEGRATION CONTRACT CANDIDATE  
Owner: AGENTROPOLIS-HOLOFOIL

## Purpose

This protocol turns the BLOCKBANGERS / ARCANA-54 / HOLOFOIL production-gate pattern into a reusable onboarding and promotion path for every game that consumes HOLOFOIL.

HOLOFOIL remains presentation and collectible manifestation authority only.

The consuming game remains authoritative for gameplay rules, legality, match state, ranking, rewards, and competitive balance.

AGENTIC-ENTITY preserves persistent identity.

## Evergreen flow

```text
GAME
 -> canonical entity + gameplay authority
 -> HOLOFOIL adapter
 -> identity/provenance validation
 -> deterministic presentation binding
 -> playable-slice validation
 -> game-specific simulation/evidence
 -> independent VERITY review
 -> dark production candidate
 -> canary
 -> verified canary
 -> production
 -> receipts
```

## Mandatory authority split

Every integration MUST declare:

- gameAuthority
- presentationAuthority = HOLOFOIL
- identityAuthority = AGENTIC-ENTITY
- governanceAuthority
- economicAuthority
- rightsAuthority
- rankingAuthority
- rewardAuthority

Unknown authority fields fail closed.

HOLOFOIL MUST NOT become authoritative for:
- deck legality
- combat
- match winner
- rank
- reward settlement
- wallet authority
- token issuance
- game economy
- IP authority

## Required onboarding artifacts

Each game MUST provide:

1. Game Integration Manifest
2. Canonical entity identity map
3. Holofoil presentation binding
4. Gameplay authority reference
5. Rights/provenance evidence
6. Deterministic material/render profile
7. Game-specific test plan
8. Production gate config
9. Independent verification result
10. Promotion receipts

## Stable identity law

A card, 3D model, reveal, inventory item, leaderboard presentation, pack representation, physical/NFC object, or chain manifestation may represent the same entity only when all of the following remain stable:

- canonical entity id
- project/game id
- lineage/provenance reference
- authoritative gameplay object reference

Presentation changes MUST NOT create a new gameplay identity.

## Presentation follows truth

HOLOFOIL may visualize:

- committed match results
- committed rank
- committed progression
- verified ownership display
- verified rarity metadata
- verified game state
- authorized unlock state

HOLOFOIL MUST NOT infer or pre-announce:
- uncommitted winners
- hidden opponent state
- unrevealed RNG
- unauthorized rarity
- unverified ownership
- pending rewards as final
- speculative rank

## Game-specific simulation gate

HOLOFOIL does not impose one universal gameplay metric.

Each game integration MUST declare its own evidence thresholds.

Examples:
- TCG: first-player advantage, dead-hand rate, dominant strategies
- racing: spawn bias, vehicle/class parity, track-side bias
- arcade: score exploit rate, input/device parity
- agentic game: agent/human fairness, tool-access parity, deterministic adjudication
- co-op: encounter completion variance, role dominance
- PvE: progression pacing, reward inflation, fail/retry loops

The integration manifest MUST include:
- metric name
- measurement method
- threshold
- sample size
- blocker severity

## Independent VERITY gate

The executor that generated evidence cannot self-approve the evidence.

Independent VERITY review MUST confirm:
- source commit
- identity continuity
- authority boundaries
- deterministic replay where applicable
- simulation/test count
- metric math
- economic boundaries
- hidden-state/privacy boundaries
- rollback path
- production gate cannot be bypassed

## Production states

Allowed states:

```text
DRAFT
 -> INTEGRATION
 -> VALIDATED
 -> DARK
 -> CANARY
 -> VERIFIED_CANARY
 -> PRODUCTION
 -> ROLLED_BACK | REVOKED
```

Skipping states is prohibited unless a separately governed exception receipt exists.

## Dark-launch rule

A game may merge integration code to production branches while runtime activation remains disabled.

`MERGED != ENABLED != CANONICAL != PRODUCTION`

## Canary requirements

Before CANARY:
- adapter valid
- identity stable
- authority preserved
- rights/provenance valid
- deterministic presentation binding
- game-specific evidence thresholds pass
- independent VERITY pass
- rollback exists
- no unauthorized economic execution

## Economic boundary

HOLOFOIL presence never grants:
- mint authority
- wallet signing
- token deployment
- treasury access
- liquidity operation
- payment authority
- reward settlement authority

Any such capability requires a separate governed execution envelope and the owning economic system.

## Required receipts

Per game:

- HOLOFOIL-GAME-INTEGRATION-RECEIPT
- HOLOFOIL-IDENTITY-BINDING-RECEIPT
- HOLOFOIL-SIMULATION-RECEIPT
- HOLOFOIL-VERITY-RECEIPT
- HOLOFOIL-CANARY-RECEIPT
- HOLOFOIL-PRODUCTION-RECEIPT
- HOLOFOIL-ROLLBACK-RECEIPT when applicable

## Reference adoption

BLOCKBANGERS becomes the first reusable reference for this protocol.

HOOD TERPS, PENGUIN ARCADE TCG, ARC agentic games, and future Gaming District games should implement the same integration contract with game-specific thresholds rather than cloning BLOCKBANGERS-specific logic.

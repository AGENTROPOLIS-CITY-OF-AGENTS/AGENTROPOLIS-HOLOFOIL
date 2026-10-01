# HERMES HANDOFF — HOLOFOIL EVERGREEN GAME ONBOARDING

Use this handoff when onboarding any new game into HOLOFOIL.

## Inputs

Required:
- GAME_REPO
- GAME_ID
- GAMEPLAY_AUTHORITY
- GOVERNANCE_AUTHORITY
- RIGHTS_AUTHORITY
- ECONOMY_AUTHORITY
- RANKING_AUTHORITY
- REWARD_AUTHORITY
- CANONICAL_ENTITY_SCHEMA
- GAME_SPECIFIC_METRICS

## Mission

Implement the HOLOFOIL Evergreen Game Integration Protocol without copying another game's gameplay assumptions.

## Process

1. Verify the game repo and current authority model.
2. Create a game integration manifest conforming to:
   `contracts/holofoil-game-integration-manifest.v1.schema.json`
3. Map canonical game identity to AGENTIC-ENTITY.
4. Bind HOLOFOIL presentation to the same canonical entity.
5. Verify rights/provenance.
6. Build a presentation adapter that consumes committed state only.
7. Define game-specific evidence metrics and thresholds.
8. Execute deterministic/reproducible tests where applicable.
9. Execute adversarial/privacy/economic-boundary tests.
10. Route evidence to an independent VERITY reviewer.
11. Keep runtime DARK until all blocking metrics and VERITY pass.
12. Promote DARK -> CANARY -> VERIFIED_CANARY -> PRODUCTION.
13. Emit receipts at every stage.

## Hard stops

STOP if:
- HOLOFOIL gains gameplay authority
- canonical identity forks
- hidden state leaks
- rights/provenance fail
- game-specific blocking metric fails
- VERITY fails
- rollback is missing
- economic capability becomes implicitly enabled

## Output

Return only:
STATUS
GAME
INTEGRATION ID
IDENTITY BINDING
AUTHORITY MAP
TESTS
GAME-SPECIFIC METRICS
VERITY
PRODUCTION STATE
RECEIPTS
BLOCKERS
NEXT ACTION

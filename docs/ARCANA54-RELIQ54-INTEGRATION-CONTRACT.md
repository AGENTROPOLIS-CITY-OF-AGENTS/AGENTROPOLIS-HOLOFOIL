# HOLOFOIL -> ARCANA//54 -> RELIQ.54 Integration Contract

## HOLOFOIL role

HOLOFOIL is the deterministic collectible/material and presentation engine. It is not the authoritative gameplay runtime.

HOLOFOIL SHOULD own:
- deterministic holographic/material surfaces
- pointer/tilt response
- card inspection
- rarity presentation
- pack/reveal interactions
- reward reveal presentation
- summon transitions
- battle-card presentation and VFX hooks
- exportable material definitions

ARCANA//54 SHOULD own authoritative gameplay rules/state/progression.
CREATOR SHOULD own production of game-ready media/world packages.
RELIQ.54 SHOULD own the selected original visual/IP vocabulary.
ORIGIN ENGINE SHOULD define the playable-slice contract and acceptance evidence.
Utility Grid SHOULD provide reusable underlying capabilities.

## Canonical identity binding

HOLOFOIL presentation MUST bind to the same canonical object identity used by ARCANA gameplay and Creator assets. Do not create a separate untraceable card identity for the same entity.

Minimum binding fields:

```text
entity_id
entity_version
arcana_rules_ref
creator_asset_ref
holofoil_material_id
holofoil_seed
reliq_taxonomy_ref
provenance_ref
```

## First proof: HOOD TERPS

Use one HOOD TERPS entity to prove:

```text
canonical entity
 -> card presentation
 -> deck/selection
 -> summon transition
 -> 3D battle representation
 -> combat outcome
 -> reward reveal
 -> collection return
```

Keep minting/wallet authority outside this proof unless separately approved.

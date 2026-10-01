# HOLOFOIL Universal NFT Trait Profile

Status: canonical manifestation contract

HOLOFOIL does not own NFT identity. ARCANA54 houses the canonical NFT object and references a HOLOFOIL trait profile.

## Trait families

1. Identity traits
2. Rarity traits
3. Material traits
4. Foil traits
5. Refraction traits
6. Color psychology traits
7. Frame traits
8. Background/environment traits
9. Character/avatar traits
10. Motion traits
11. Dimensional traits
12. Gameplay visualization traits
13. AGENT-ENTITY visualization traits
14. 404 visualization traits

## Core law

> ARCANA54 owns NFT identity/state references. HOLOFOIL owns deterministic manifestation.

## Identity traits

- project
- collection
- series
- set
- edition
- character
- faction
- district
- world
- object_type
- agent_entity_ref
- tcg_card_ref

## Rarity traits

Separate rarity into:

- rarity_visual
- rarity_supply
- rarity_gameplay
- rarity_lineage

Suggested display classes:

- COMMON
- UNCOMMON
- RARE
- EPIC
- LEGENDARY
- MYTHIC
- RELIQ
- GENESIS
- ONE_OF_ONE

Visual rarity MUST NOT silently create gameplay advantage.

## Material traits

Suggested base materials:

- matte
- gloss
- chrome
- obsidian
- liquid_glass
- crystal
- ice
- carbon
- metal
- ceramic
- neon_glass
- holographic_polymer
- prismatic
- black_mirror

## Foil traits

- NONE
- STANDARD_FOIL
- RAINBOW_FOIL
- PRISMATIC
- DIFFRACTION
- SHATTER_FOIL
- AURORA
- GLITCH_FOIL
- LIQUID_FOIL
- FROST_FOIL
- BLACKLIGHT_FOIL
- VOID_FOIL

Parameterize with foil_density, foil_angle, foil_speed, foil_response and foil_seed.

## Refraction traits

- refraction_index
- dispersion
- chromatic_split
- light_scatter
- internal_glow
- caustics
- edge_refraction

## Color psychology traits

- base_palette
- affect_profile
- doctrine_palette
- battle_palette
- rarity_accent
- system_semantic_override

Operational system semantics always win over decoration.

## Frame traits

- frame_shape
- frame_material
- frame_depth
- frame_rarity
- frame_faction
- frame_doctrine
- frame_damage_state
- frame_evolution_tier

## Environment traits

- location
- biome
- weather
- time_of_day
- world_layer
- district
- lighting
- environment_fx

## Character/avatar traits

- body
- outfit
- headwear
- eyewear
- expression
- pose
- weapon
- equipment
- accessory
- aura
- stance
- animation_state

## Motion traits

- motion_profile
- camera_motion
- parallax_depth
- idle_animation
- hover_response
- touch_response
- tilt_response
- battle_response
- evolution_response

## Dimensional traits

- 2D
- 2.5D
- 3D
- VOLUMETRIC
- AR_READY
- XR_READY
- PHYSICAL_BINDABLE

Optional mesh/rig fields:

- mesh_ref
- lod_profile
- rigged
- animated
- physics_enabled

## Gameplay visualization

HOLOFOIL MAY visualize level, XP, class, role, equipment, status, evolution tier, battle history, victories and achievements, but those values MUST come from an authoritative gameplay source/receipt.

## AGENT-ENTITY visualization

HOLOFOIL MAY visualize public agent role, skill slots, doctrine refs, reputation, trust, mission count, collective membership and runtime class.

Never embed raw memory, secrets, credentials, private user context or hidden reasoning.

## 404 visualization

- 404_profile
- 404_balance_class
- whole_unit_required
- fragment_state
- fusion_state
- evolution_eligible
- card_matter
- agent_matter
- lineage_parent
- lineage_children
- burn_redeem_policy

## Determinism

Every manifestation SHOULD resolve from:

```text
ARCANA54 NFT ID
+ project DNA / lineage
+ approved HOLOFOIL trait profile
+ deterministic seed
+ authoritative dynamic receipts
= reproducible manifestation
```

## Universal inheritance

$PENGUIN and BLOCKBANGERS are first-party proving projects. Their project-specific trait vocabularies MUST extend this profile rather than fork HOLOFOIL.

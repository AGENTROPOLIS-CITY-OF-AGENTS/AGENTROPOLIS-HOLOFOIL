# Holofoil -> ATG Transform Integration

Holofoil is a consumer of ATG TRANSFORM. It does not redefine ATG semantics.

## Responsibility split

**ATG answers:** what is this asset/system, how was it transformed, what remains uncertain, what constraints apply, and what was actually verified?

**Holofoil answers:** how does a verified asset become a collectible product, game object, drop, mint package, rights-aware artifact, or client deliverable?

```text
CLIENT INPUT
  ↓
ATG TRANSFORM / ATG Runtime
  ↓
ATG Transform IR
  ↓
HOLOFOIL
  ├─ collection composition
  ├─ deterministic collectible DNA
  ├─ metadata
  ├─ Holofoil materials
  ├─ game/drop services
  ├─ launch state
  ├─ mint preparation
  └─ receipts
```

## Hood Terps beta path

For degraded/flattened references:

```text
REFERENCE
→ ATG.RECON
→ ATG.DECOMPOSE
→ ATG.GEO
→ ATG.INFER
→ ATG.SYNTHESIZE
→ ATG.ALIGN
→ ATG.CONSTRAINT
→ ATG.VERIFY
→ canonical ATG entity + provenance
→ HOLOFOIL GEN
→ collectible DNA + metadata
→ Drop Mode / mint preparation
```

Hood Terps remains the IP owner. Holofoil remains the reusable product/platform. ATG remains the language/transform semantic layer.

## Epistemic preservation

Holofoil MUST preserve ATG property states:

- OBSERVED
- RECOVERED
- INFERRED
- SYNTHESIZED

Holofoil must never relabel inferred or synthesized geometry as an original source asset.

## Example canonical entity

```text
ENTITY HoodTerp_0033

left_eye.geometry = OBSERVED
right_eye.color = SYNTHESIZED
pants.geometry = SYNTHESIZED
hand.pose = INFERRED
joint.relation = VERIFIED

constraints:
  joint_between_fingers = PASS
  no_palm_intersection = PASS
  pants_shoe_alignment = PASS

provenance:
  owner = HOOD_TERPS
  source_refs = [...]
```

Holofoil then adds domain state such as collection ID, collectible index, normalized trait vector, collectible DNA, metadata refs, launch phase, chain target, mint preparation, and receipts.

## Constraint boundary

ATG constraints can include geometry, continuity, physics, compatibility, rights, policy, and accessibility.

Holofoil adds collectible-domain constraints such as:

- trait uniqueness
- supply
- collection compatibility
- mint phase
- eligibility
- price configuration
- launch state

Financial execution remains governed and is not granted by successful ATG verification.

## Runtime rule

Holofoil should call ATG Runtime/Compiler through a narrow utility seam. Holofoil should not vendor provider-specific MiniMax, segmentation, depth, world-model, or reconstruction syntax into its canonical project state.

Provider adapters may change without changing the Holofoil collection contract.

## Future use

The same ATG entity may be compiled by Holofoil into:

- static collectible
- animated collectible
- TCG/game object
- 3D/AR asset
- spatial object
- derivative/IP asset
- dynamic stateful collectible
- future world-model compatible object

The entity remains canonical while target packaging evolves.

# TRELLIS.2 3D Manifestation Contract

Status: evaluate/priority

TRELLIS.2 is an image-to-3D generation adapter that may produce candidate meshes for Holofoil manifestations. It does not grant IP authority, mint authority, commercial rights, or production approval.

## Corridor

```text
IP Authority Receipt
-> rights-cleared source image / reference sheet
-> TRELLIS.2 candidate generation
-> PBR/mesh extraction
-> Blender cleanup + optimization
-> Holofoil material pass
-> visual verification
-> runtime/render profile selection
-> human approval
-> manifestation receipt
```

## Required boundaries

- Public IP District remains the rights authority.
- Holofoil manifests approved assets only.
- TRELLIS.2 output is candidate geometry until verified.
- Source hashes, generation settings, mesh hash, optimized mesh hash, and material profile must be retained.
- Game-ready and collectible-render profiles may diverge, but must share lineage.
- No source image with unclear rights enters production.

## Profiles

### Collectible render profile

Optimized for premium close-up rendering, foil materials, refractive effects, holographic overlays, turntables, and marketplace previews.

### Game/runtime profile

Optimized for frame time, memory, texture budget, LOD, collision, and engine/browser compatibility.

The runtime profile must never silently replace the archival or collectible master.

## Holofoil receipt additions

```json
{
  "generator": "TRELLIS.2",
  "source_asset_hash": "sha256:...",
  "candidate_mesh_hash": "sha256:...",
  "optimized_mesh_hash": "sha256:...",
  "material_profile": "holofoil-pbr-v1",
  "runtime_profile": "collectible|web|mobile|engine",
  "rights_receipt": "ATG:IP/...",
  "visual_verification": "pass|fail",
  "human_approval": true
}
```

## Acceptance rule

Generated != verified. Holofoil may style, animate, present, and package an approved 3D asset, but it must not infer ownership, rights, authenticity, or production readiness from generation success alone.

# HOLOFOIL Heavy-Build Runtime Derivatives

Status: CANONICAL INTEGRATION CONTRACT
Owner: AGENTROPOLIS-HOLOFOIL
Upstream authority: AGENTROPOLIS-GAMING-DISTRICT / CHAOS GAMING DEVELOPMENT PRODUCTIONS (GDP)

## Role

HOLOFOIL manifests premium collectible and game-facing visual variants without forcing the archival collectible master into every runtime target.

The collectible master remains the source of truth. Runtime manifestations are governed derivatives.

## Runtime derivative classes

HOLOFOIL may emit:

- web-light
- mobile-low
- mobile-mid
- mobile-high
- desktop
- xr-spatial
- cinematic-capture

A derivative may vary texture resolution/codec, mesh LOD ceiling, material complexity, animation density, post effects, and optional payload while preserving identity-critical visual traits.

## Fidelity floor

Optimization must not silently alter identity-critical collectible properties such as:

- defining silhouette
- canonical color/material identity
- required markings or traits
- ownership/provenance association
- approved animation semantics

If a device tier cannot preserve the required fidelity floor, the runtime must fall back to a simpler approved representation rather than fabricate a degraded canonical master.

## Integration corridor

```text
HOLOFOIL archival/collectible master
  -> approved runtime derivative
  -> CREATOR/device-profile metadata
  -> PARALLAX verification
  -> Gaming District benchmark
  -> heavy-build performance receipt
```

## Packaging rule

Do not package cinematic/XR/high-resolution variants into mobile installations unless the target device or delivery path explicitly requests them.

## Release rule

A Holofoil runtime derivative is not considered production-ready solely because it renders. The target build must produce a valid `agentropolis.heavy-build-performance-receipt.v1` with fidelity, playability, and sustained-run evidence.

## Authority boundary

HOLOFOIL owns collectible manifestation and identity preservation. Gaming District owns target-device performance acceptance. PARALLAX owns spatial/runtime verification. EXL3/model quantization remains a separate inference concern.

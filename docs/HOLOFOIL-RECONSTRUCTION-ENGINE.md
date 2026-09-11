# Holofoil Reconstruction Engine

## Purpose

Rebuild a canonical, mintable layer library when client-owned source art is incomplete, flattened, compressed, screenshot-derived, or otherwise unsuitable as production masters.

This is **not classical photogrammetry** unless multiple calibrated views of the same subject are available. For single or low-quality 2D references, Holofoil uses an inverse-graphics pipeline: segmentation, alpha matting, geometric alignment, symmetry priors, depth estimation, vector/parametric reconstruction, procedural variation, deterministic compositing, and quantitative QC.

**Critical truth rule:** hidden pixels are not "recovered." They are reconstructed as new production assets from client-owned references and approved against canon.

## Ownership

- Client IP remains client IP.
- Holofoil owns the reusable reconstruction service and pipeline.
- Reconstructed layers retain provenance back to source references and reconstruction receipts.
- Unknown-provenance downloads are REFERENCE ONLY until ownership/source is verified.

## Pipeline

```text
REFERENCE INGEST
  -> SOURCE CLASSIFICATION
  -> DECOMPRESSION / DENOISE
  -> SUBJECT SEGMENTATION
  -> ALPHA MATTING
  -> LANDMARK DETECTION
  -> CANONICAL POSE ALIGNMENT
  -> TRAIT REGION ISOLATION
  -> OCCLUSION ANALYSIS
  -> SYMMETRY / SHAPE PRIOR
  -> 2.5D DEPTH + NORMAL ESTIMATION
  -> PARAMETRIC / VECTOR REDRAW
  -> COLOR / MATERIAL DECOMPOSITION
  -> LAYER SYNTHESIS
  -> CROSS-TRAIT COMPATIBILITY
  -> NUMERICAL QC
  -> HUMAN CANON APPROVAL
  -> TESTNET-APPROVED LAYER LIBRARY
```

## 1. Source classification

Every file receives a source class:

- ORIGINAL_LAYER
- FLATTENED_REFERENCE
- COMPRESSED_REFERENCE
- SCREENSHOT_REFERENCE
- UNKNOWN_PROVENANCE

Record dimensions, alpha presence, perceptual hash, cryptographic digest, suspected resampling/compression, and provenance status.

Do not promote a screenshot to "original" based on visual quality.

## 2. Denoise and resampling

Discord/JPEG artifacts are treated as measurement noise, not style.

Use conservative restoration before segmentation:

- deblocking
- ringing suppression
- chroma artifact reduction
- edge-aware denoise
- super-resolution only as a reconstruction aid, never as provenance proof

Preserve the untouched source alongside any restored derivative.

## 3. Segmentation + alpha matting

For each visible trait region estimate a mask `M(x,y)` and alpha field `alpha(x,y)`.

Composite model:

`I = alpha F + (1 - alpha) B`

where `I` is the observed image, `F` the foreground trait and `B` the underlying/background estimate.

Binary segmentation alone is insufficient around hair, smoke, laces, fabric edges and leaf-eye contours; use soft alpha boundaries.

## 4. Canonical geometry

All reconstructed traits must map to one canonical character coordinate system.

Detect landmarks for head, eyes, shoulders, wrists, hips, knees, ankles, shoes and hand-item grip points.

For corresponding landmarks `p_i` and canonical landmarks `q_i`, solve a similarity transform minimizing:

`E = sum_i w_i || s R p_i + t - q_i ||^2`

using weighted Procrustes alignment.

For nonrigid clothing deformation, use bounded thin-plate-spline or mesh warps after the global similarity transform.

Store the transform and residual error in the receipt.

## 5. Occlusion reasoning

A flattened character does not reveal pixels hidden behind a hoodie, hand, hair or accessory.

For each trait estimate:

- visible support
- occluded support
- confidence
- reconstruction risk

Use symmetry, neighboring examples and canonical geometry as priors, but mark synthesized hidden regions as reconstructed.

Never claim original unseen geometry was recovered.

## 6. Symmetry priors

Human clothing and character designs often exhibit approximate bilateral symmetry.

A useful regularizer is:

`E_sym = || L(x,y) - mirror(R(x,y)) ||`

weighted down for intentionally asymmetric traits.

This is particularly useful for pants silhouettes, shoes, eye placement and jacket geometry.

## 7. 2.5D depth and surface normals

For flattened art, estimate relative depth `D(x,y)` and surface normal field `N(x,y)` to help separate overlaps and support Holofoil materials.

This is 2.5D inference, not metrologically accurate 3D photogrammetry.

Depth ordering can establish layers such as:

background < rear hair < body < clothing < front hair < jewelry < hand < held item < foreground smoke

Store uncertainty with depth estimates.

## 8. Parametric reconstruction

For high-value trait families, do not rely on cutout extraction alone. Rebuild them as canonical production primitives.

Examples:

### Eyes

Parameterize:

- style
- color
- scale
- rotation
- glow
- pupil/leaf geometry
- left/right independence

The Hood Terps eye system currently supports 8 styles x 13 colors = 104 variants per eye and 10,816 theoretical ordered left/right pairs before compatibility filtering.

### Pants

Represent silhouette by control points or a canonical mesh:

- waist height
- hip width
- thigh width
- knee width
- hem width
- inseam length
- rise
- taper
- stacking amount
- pocket configuration

This allows controlled families such as low-rise barrel, barrel, classic sweats, Terp Cloud sweats, Couch Lock sweats, cargo, parachute, stacked and baggy denim without hand-drawing every color combination.

### Footwear

Use canonical shoe silhouettes with parameterized:

- outsole profile
- upper silhouette
- collar height
- laces
- panel accents
- sole/accent colors

Avoid third-party logos or protected brand identifiers.

## 9. Color synthesis

Do not perform naive RGB tinting.

Separate approximate luminance and chroma, then recolor in a perceptually more uniform space such as OKLab while retaining shading and edge detail.

For target color `c_t`, preserve local luminance structure and constrain color-distance discontinuities at boundaries.

Each colorized derivative is its own generated asset with provenance.

## 10. Deterministic composition

Represent a character as a trait vector:

`T = (body, colorway, hair, headwear, eye_L, eye_R, face, top, bottom, footwear, sock, hand, item, jewelry, weed, aura)`

Canonical DNA is a hash over the normalized trait vector plus generation schema version and deterministic seed:

`DNA = H(schema || seed || normalize(T))`

Duplicate DNA is forbidden unless explicitly designing editions.

## 11. Compatibility as a constraint-satisfaction problem

Do not sample blindly.

Define compatibility predicates `C_j(T) in {0,1}` and accept only:

`valid(T) = product_j C_j(T) = 1`

Examples:

- hood-up conflicts with some large hairstyles/headwear
- certain pants expose socks; others do not
- shoes must align to the hem/ankle geometry
- hand item requires compatible hand pose
- mask and jewelry cannot occupy impossible geometry
- special eyes may be restricted to approved combinations

Generation becomes constrained sampling from the valid state space.

## 12. Joint/blunt hand-placement geometry

Hood Terps hard rule:

The item must lie naturally between the index and middle fingers in the intended V-clutch.

Let finger centerlines be `f1(s)` and `f2(s)` and the held-item centerline be `j(t)`.

Require:

- the grip segment to lie inside the corridor between the two finger centerlines
- no intersection with palm mask
- no penetration of finger masks beyond the intended contact region
- stable depth ordering through the grip

If the geometry fails, status = `ART_QC_BLOCKED`.

## 13. Quantitative QC

For each reconstructed trait or composite, record measurements such as:

- silhouette IoU
- landmark RMSE
- edge Chamfer distance
- alpha-boundary error
- perceptual distance to approved references
- symmetry residual
- occlusion risk
- reconstruction confidence

Illustrative testnet acceptance rule:

- human canon approval required
- confidence >= 0.90
- occlusion risk <= 0.20

Thresholds are engineering defaults and may be tuned from beta evidence. They are not claims of visual perfection.

## 14. Human-in-the-loop canon gate

Math can reject bad geometry. It cannot decide Hood Terps canon by itself.

NEURO surfaces only uncertain/high-impact choices to the founder:

- "These two references disagree on pant rise. Which is canonical?"
- "This shoe silhouette contains an ambiguous logo. Reconstruct without branding?"
- "The left hand is occluded in all references. Approve this reconstructed grip?"

Founder approval becomes part of the reconstruction receipt.

## 15. GENESIS TEST 033

Do not begin with 3,333 production mints.

Reconstruct only enough canonical layers to generate 33 controlled test characters covering:

- male and female presentations
- all five colorways
- all eight eye styles
- matched and mixed eyes
- low-rise barrel pants
- Terp Cloud sweats
- Couch Lock sweats
- cargo / parachute / baggy denim
- multiple footwear silhouettes
- multiple hand/item states

Then run:

`compose -> QC -> DNA -> dedupe -> metadata -> preview -> Holofoil mint prepare -> Aqueduct/testnet -> Robinhood Chain Testnet 46630 -> verify -> receipt`

Production remains OFF.

## 16. What this solves

Even if the only surviving art is low-quality Discord downloads, Holofoil can rebuild a new, aligned, deterministic production layer system from client-owned visual references.

What it cannot do is mathematically recover information that never existed in the pixels. Hidden details must be reconstructed, versioned, approved and disclosed internally as such.

That distinction is the trust boundary between reconstruction science and hallucination.

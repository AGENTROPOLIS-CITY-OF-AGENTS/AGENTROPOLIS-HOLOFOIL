# HOLOFOIL Access, Membership, and Proof Policy

## Product boundary

HOOD TERPS is the first project used to prove the Agentropolis production pipeline. It is **not** a public HOLOFOIL product section and MUST NOT appear in public navigation, marketing data, public project indexes, or unauthenticated API responses.

The HOOD TERPS proof is QA/integration infrastructure. Preserve it behind an internal authorization boundary.

Preferred internal route:

`/internal/proofs/hood-terps`

The legacy `/proof` route MUST NOT reveal project data to guests or ordinary members. It may redirect only after authorization or return a safe access-denied/not-found surface.

## Access classes

### GUEST

May access approved public product/marketing surfaces and capability previews. Guest access does not include operational creation capabilities or project fixtures.

### MEMBER

An authenticated Agentropolis member/subscriber may use capabilities granted by their entitlement/plan and mandate. Membership is an access prerequisite, not execution authority.

### INTERNAL

An authenticated internal identity with `internal.proofs.view` may access governed QA fixtures, integration diagnostics, receipts, and the HOOD TERPS proof harness.

## Capability model

Operational UI MUST gate behavior through capability grants rather than payment-provider checks or route-name assumptions.

Canonical initial capabilities:

- `holofoil.material.use`
- `holofoil.card-studio.use`
- `holofoil.3d-stage.use`
- `holofoil.project.create`
- `origin.playable-slice.request`
- `creator.game-package.request`
- `internal.proofs.view`

Membership/subscription may produce entitlements. Entitlements may grant capabilities. A mandate still constrains what an authorized capability may execute.

## Authority boundary

Membership MUST NOT automatically grant publishing, deployment, minting, wallet signing, payments, provider spend, or other governed authority.

`Membership != authority.`

## Public navigation

Approved public navigation may expose HOLOFOIL product capabilities such as Campus, Material Lab, Card Studio, Creature-Dex, 3D Stage, Storyboard, and SDK/Integration.

`Proof` and named internal projects MUST NOT appear in public navigation.

## Development adapters

Until production Agentropolis identity/membership services are connected, a fixture access adapter MAY be used for local development. It MUST be visibly classified as `FIXTURE` and MUST NOT be represented as production authentication.

## Required tests

- guest cannot access the HOOD TERPS proof
- ordinary member cannot access the proof without `internal.proofs.view`
- authorized internal identity can access the proof
- public navigation does not expose `Proof`
- legacy `/proof` does not reveal HOOD TERPS data
- internal proof retains `hood-terps:0001` identity continuity
- wallet, mint, and payment remain disabled in the proof

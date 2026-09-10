# HOLOFOIL Access Control

HOLOFOIL is an Agentropolis capability application. Project fixtures are not public product navigation.

## Access classes

- **GUEST** — approved marketing/capability previews and membership/sign-in entry points. No operational workspace and no project fixtures.
- **MEMBER** — authenticated Agentropolis membership plus explicit capability entitlements. Membership grants access to tools; it does not grant publishing, deployment, minting, wallet signing, payments, or provider spend.
- **INTERNAL** — separately authorized internal/dev/QA access. May view governed project proof fixtures and receipts when `internal.proofs.view` is granted.

## Project isolation

HOOD TERPS is Project #1 proving the production pipeline. It is not part of the public HOLOFOIL product surface and MUST NOT appear in public navigation or unauthenticated responses.

The working HOOD TERPS proof SHOULD live behind an internal route such as `/internal/proofs/hood-terps`. The public `/proof` route MUST NOT expose project data.

## Capability model

UI and runtime access SHOULD be based on capabilities rather than payment-provider conditionals. Initial capability vocabulary is defined in `src/contracts/holofoil-access.ts`.

Subscription/membership -> entitlements -> capability access -> mandate/policy -> execution.

Authority remains separately governed.

## Development adapters

A fixture access context may be used during development only when visibly identified as `FIXTURE`. Fixture authentication MUST NOT be represented as production authentication.

# Grok Build Addendum — Holofoil Drop Mode

Continue from the existing Holofoil Creator Cloud implementation. Do not create a parallel launch subsystem.

## Read these new files first

- `src/lib/creator-cloud/launch.ts`
- `src/contracts/drop-mode.v1.ts`
- `src/contracts/agent-launch-operator.v1.ts`

## Product rule

Holofoil owns its launch interaction model. Preserve the native launch hierarchy:

`IDENTITY -> SCARCITY -> ACCESS PHASE -> TIME -> ACTION`

Do not add external product/model attribution to the codebase or documentation for these patterns.

## Build next

1. Add a `Drop Mode` surface that consumes the existing Creator Cloud project state.
2. Do not duplicate project, pricing, supply, metadata, or launch state.
3. Add launch-recipe selection using `LAUNCH_RECIPES`.
4. Add Easy Mode copy for phased access.
5. Add truthful supply/progress display. Live scarcity requires verified state.
6. Add timezone-aware launch timing.
7. Add state-aware CTA: Notify Me, Early Access, Collect, Sold Out, View Collection.
8. Add marketplace routing only when a route is configured and verified.
9. Add Agent Launch Operator UI using the shared launch contract.
10. Keep Web2-only drop pages valid without wallet or blockchain dependencies.
11. Lazy-load Web3 libraries only when a Web3 action is chosen.
12. Keep 3D/Holofoil heavy rendering deferred until intent.
13. Preserve Quantization Torque and existing source-preservation rules.
14. Emit Drop Mode and Quantization receipts before claiming production-ready.

## Non-negotiable integrity rules

- no fake countdowns
- no fake sold-out states
- no fake mint progress
- no fake collector activity
- no fake scarcity
- no invented marketplace links
- no invented contract addresses
- no invented on-chain status
- label draft, estimate, simulation, and unverified state explicitly

## Agent rule

Agents may inspect, configure, validate, simulate, and prepare launches. Live financial/on-chain execution remains governed and must honor the applicable Execution Envelope.

## Quantization rule

The drop page should be one of the lightest public surfaces in Holofoil. Do not make visitors download the 3D campus, Material Lab, full agent tooling, or Web3 stack just to view a drop.

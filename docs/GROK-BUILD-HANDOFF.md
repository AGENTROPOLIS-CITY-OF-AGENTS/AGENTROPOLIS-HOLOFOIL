# Grok Build Handoff — Holofoil Creator Cloud

## Mission

Continue Holofoil as a Web2-first creator-to-chain service that feels like Wix/Shopify/Canva for collectible drops.

Reference benchmark for the visual layer-composition interaction:

https://nft-layer-mixer.vercel.app/app

Do not clone the reference. Exceed it.

## Canon

- Holofoil owns the collectible builder, layer mixer, metadata compiler, Holofoil material pass, validation, launch preparation, and governed publish/mint service.
- Agentropolis Creator supplies approved assets and creation capabilities.
- ARCANA54 consumes/spatializes Holofoil outputs for world, playable, and spatial presentation.
- Agentropolis Grid governance / 54T controls sensitive execution policy and approval.
- Human and agent users operate through the same canonical Creator Cloud job model.

## Product modes

### Easy Mode — default

No crypto jargon. Flow:

Idea -> Artwork -> Mix -> Generate -> Price -> Publish

Use plain Web2 language. Never force wallet, RPC, IPFS, gas, token-standard, calldata, or contract vocabulary into the normal onboarding path.

### Pro Mode

Expose advanced controls only when requested:

- chain
- wallet/account
- token standard
- contract settings
- storage
- metadata URI
- royalties
- transaction simulation
- agent/API controls

### Agent Mode

Agents can inspect catalogs, submit deterministic composition jobs, lock/exclude/require traits, generate batches, validate duplicate DNA, compile metadata, request previews, simulate publishing, and request governed execution.

Agents never bypass provenance, validation, mandate, permissions, or approval gates.

## Existing implementation to continue

- `docs/CREATOR-CLOUD-WEB2-ONBOARDING.md`
- `docs/REFERENCE-NFT-LAYER-MIXER.md`
- `src/contracts/creator-cloud-job.v1.ts`
- `src/routes/builder.tsx`
- existing Holofoil Material Lab, Card Studio, Stage, Storyboard, SDK, auth, and design system

## Build next

1. Make `/builder` production-grade and mobile-first.
2. Add `Build My Drop` to primary navigation.
3. Replace stale copy that says `No mint / no wallet` with language that reflects optional governed publishing.
4. Implement a real layer workspace:
   - asset tray
   - folders/categories
   - z-order drag/reorder
   - visibility toggles
   - lock trait
   - exclude rule
   - require-with rule
   - randomize
   - deterministic seed
   - live composite preview
   - multiple preview grid
5. Implement collection-capacity calculation before generation.
6. Implement duplicate-DNA detection and impossible-combination warnings.
7. Add CSV import for metadata/traits and layer-manifest import.
8. Compile canonical NFT-style metadata without forcing users to see JSON.
9. Add Holofoil material preview after composition.
10. Add Web2 launch-estimate UI that translates network fees into normal dollars/estimated cost language.
11. Add account onboarding with familiar sign-in surfaces; wallet details live behind progressive disclosure where supported.
12. Add publish simulation before any financial execution.
13. Add explicit approval gate for live Web3 execution.
14. Return a structured provenance/execution receipt.
15. Keep Web2-only publishing/export as a first-class destination; Web3 is optional.

## UI direction

Use the Agentropolis design system:

- obsidian base
- cyan system/navigation signals
- lime action/ready states
- restrained red for risk/block states
- compact cyber-noir typography
- no giant white cards
- responsive mobile layout
- progressive disclosure rather than developer-heavy forms

The default user should feel like they are building a product page or Canva project, not deploying a smart contract.

## Primary headline

HOLOFOIL CREATOR CLOUD

`Build your drop like a website. Publish it like a product.`

## Core Easy Mode copy

- `What do you want people to collect?`
- `Add your artwork`
- `Mix your collection`
- `How many should we create?`
- `Set up your sale`
- `Ready to publish`
- `Build With Agent`
- `View advanced details`

## Architecture

```text
                    HOLOFOIL CREATOR CLOUD
                              |
             +----------------+----------------+
             |                                 |
        HUMAN BUILDER                    AGENT BUILDER
        Easy / Pro UI                  JSON / MCP / ATG
             |                                 |
             +----------------+----------------+
                              |
                    CANONICAL JOB MODEL
                              |
                      COLLECTION ENGINE
                              |
                         LAYER MIXER
                              |
                     DNA / CONSTRAINTS
                              |
                         METADATA
                              |
                      HOLOFOIL MATERIAL
                              |
                    VALIDATE / SIMULATE
                              |
                  GOVERNED PUBLISH REQUEST
                              |
          WEB2 EXPORT                     OPTIONAL WEB3
                              |
                            RECEIPT
```

## Non-negotiables

- Do not reassign minter ownership to HOOD-TERPS.
- Do not make the visual layer mixer the whole product; it is one component of Creator Cloud.
- Do not require a wallet to begin creating.
- Do not make Web3 mandatory.
- Do not invent traits or rarity values.
- Do not let an agent silently execute a financial transaction without the applicable authority and approval.
- Preserve accessibility and reduced-motion behavior already present in Holofoil.

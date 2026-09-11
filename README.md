# AGENTROPOLIS HOLOFOIL

Holofoil Creator Cloud is the Web2-first collectible builder, deterministic layer mixer, material system, metadata compiler, and governed publishing surface for Agentropolis.

The product is intentionally simple on top and powerful underneath: creators can build a drop like they would build a website, while Holofoil handles collection structure, metadata, provenance, optional Web3 publishing, and agent interoperability.

## Ownership

Holofoil owns the collectible build and publish experience.

```text
Agentropolis Creator approved assets + creation tools
  -> Holofoil Creator Cloud
       -> Web2 Easy Mode
       -> Pro Mode
       -> Layer Mixer / Collection Generator
       -> deterministic DNA + metadata
       -> Holofoil material treatment
       -> provenance + validation
       -> optional governed publish/mint
  -> optional ARCANA54 spatial placement / playable presentation
```

- **Agentropolis Creator** supplies approved source assets and creation capabilities.
- **Holofoil** owns composition, collection generation, metadata compilation, Holofoil presentation, launch preparation, and the mint/publish service.
- **ARCANA54** consumes or spatializes Holofoil outputs and can surface them in worlds, playable scenes, and collectible experiences.
- **AGENTROPOLIS-54T / Grid governance** owns security policy, execution controls, and approvals for sensitive financial actions.

## Web2-first principle

The default user should never need to understand wallets, RPCs, IPFS, token standards, contract deployment, or gas math just to make a collection.

Default flow:

```text
Idea -> Upload -> Mix -> Generate -> Price -> Publish
```

Advanced blockchain controls live behind Pro Mode.

## Surfaces

- **Campus** - 3D Holofoil district
- **Build My Drop** - Wix/Shopify-style guided creator onboarding
- **Layer Mixer** - visual trait/layer composition and live preview
- **Material Lab** - foil type, intensity, refraction, glow, opacity, grain, fresnel, light, pointer, tilt, animation, reset, export
- **Card Studio** - procedural sprites, pixel editor, trading-card foil wrap, metadata/pack export
- **Creature-Dex** - original specimens as collectible presentation records
- **3D Stage** - pavilions and spatial material rooms
- **Storyboard** - deterministic reveal beats
- **Agent Interface** - machine-readable collection jobs, validation, simulation, and governed execution requests
- **SDK / Integration** - typed adapter contracts for Creator, ARCANA54, agents, and external surfaces
- Internal QA: `/internal/proofs/hood-terps`

## Reference benchmark

Product benchmark: https://nft-layer-mixer.vercel.app/app

Holofoil should exceed the reference by combining visual layer composition with deterministic DNA, duplicate prevention, trait constraints, batch generation, Web2 onboarding, Holofoil materials, metadata compilation, agent-native operation, simulation, provenance receipts, chain adapters, and governed publishing.

## Material schema

`agentropolis.holofoil.material.v1`

Foil types: holographic, chromatic, prism, neon-glitch, brushed-foil, rainbow-diffraction, serialized-collectible, museum-glass, obsidian-foil, custom.

## Agent rule

Humans and agents are clients of the same canonical Holofoil job model. Agents do not receive a bypass around validation, provenance, mandate, policy, or execution approval.

Agents may inspect catalogs, compose, generate, validate, simulate, and prepare a publish request. Financial execution requires authority in the applicable execution envelope.

## Commands

```bash
npm install
npm run dev
npm run lint
npm test -- --run
npm run build
```

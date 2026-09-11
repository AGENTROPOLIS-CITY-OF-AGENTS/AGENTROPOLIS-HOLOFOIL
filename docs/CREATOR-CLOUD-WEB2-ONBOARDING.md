# Holofoil Creator Cloud — Web2-first onboarding

## Product promise

Build your drop like a website. Publish it like a product.

Holofoil must feel familiar to a Wix, Shopify, Squarespace, or Canva user. Web3 is optional infrastructure, not prerequisite vocabulary.

## Default Easy Mode

The first screen asks one plain-language question:

> What do you want people to collect?

Choices:

- Digital art collection
- Trading cards
- Avatar collection
- Game items
- Membership / access pass
- Limited-edition drop
- I am not sure — help me build it

The user may also describe the project in natural language. The assistant translates intent into a Holofoil collection job.

## Six-step corridor

### 1. Idea

Ask what the creator wants to make, who it is for, and roughly how many items they want.

Do not expose blockchain settings.

### 2. Artwork

Accept:

- finished images
- transparent PNG layer folders
- GIF / animation
- video
- audio
- 3D assets

Holofoil may suggest layer categories but must never silently invent canonical traits.

### 3. Mix

Visual composer inspired by the workflow benchmark at:

https://nft-layer-mixer.vercel.app/app

Holofoil must go further:

- drag/drop layers
- reorder layers
- lock traits
- exclude combinations
- force compatible combinations
- randomize preview
- preview multiple generated outputs
- show duplicate-DNA warnings
- show available combination capacity
- apply Holofoil material preview

### 4. Generate

Plain-language controls:

- How many should we create?
- Make every item unique
- Avoid invalid combinations
- Keep these traits together
- Never combine these traits
- Surprise me
- Let Holofoil balance the collection

Behind the UI Holofoil generates deterministic identity/DNA, validates uniqueness, and compiles metadata.

### 5. Price

Translate technical terms into product language.

| Web2 label | Advanced meaning |
| --- | --- |
| How much should each collectible cost? | mint price |
| How many can exist? | max supply |
| Who gets early access? | allowlist / presale |
| Creator earnings on future sales | royalty configuration |
| Estimated network fee | gas / execution cost |
| Publish Collection | deploy / activate sale |

Never force a creator to read raw gas values, calldata, RPC configuration, or token standards in Easy Mode.

### 6. Publish

Show a launch checklist:

- Artwork ready
- Unique outputs validated
- Collection information ready
- Files optimized
- Price configured
- Access configured
- Publishing destination selected
- Estimated total cost

Then present one action:

> Publish Collection

If Web3 publishing is selected, Holofoil may provision or connect the required account/wallet infrastructure behind a normal sign-in flow where supported. Advanced users can expose wallet, chain, contract, storage, and transaction details in Pro Mode.

## Account onboarding

Primary sign-in options should be familiar Web2 mechanisms:

- Email
- Google
- Apple
- Passkey

A wallet should not be the first screen.

## Cost presentation

Easy Mode presents costs as a launch estimate:

- Collection setup
- Storage
- Network fee estimate
- Optional services
- Total estimated launch cost

Pro Mode can expose raw chain details.

## Build With Agent

Every major builder step should expose a `Build With Agent` action.

Examples:

- "Make this a 669-piece collection."
- "Keep gold accessories uncommon."
- "Never combine red hats with green jackets."
- "Generate 20 previews before I publish."

The assistant modifies the same canonical Holofoil job used by the visual UI.

## Progressive disclosure

Holofoil has two views over one engine:

### Easy Mode

Idea -> Artwork -> Mix -> Generate -> Price -> Publish

### Pro Mode

Adds:

- chain selection
- token standard
- contract configuration
- wallet/account configuration
- storage backend
- metadata URI controls
- royalty settings
- batch minting
- advanced trait constraints
- agent/API controls
- transaction simulation

## Safety / governance

Composition, preview, metadata generation, and simulation can be automated.

Publishing or any financial transaction must pass the applicable Agentropolis execution envelope, permissions, policy controls, and approval requirements.

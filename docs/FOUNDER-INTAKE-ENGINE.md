# Holofoil Founder Intake Engine v1

> Upload it. Tell us. Or build it with NEURO.

The Founder Launch Package is an internal generated artifact. It is **not** a customer form.

## KISS rule

Never show a founder a wall of empty fields. Show the next useful decision. Advanced machinery stays behind progressive disclosure.

## Three intake paths

A new client starts with one of three paths:

1. **Upload Project Files** — ZIP, PDF, PPT/PPTX, DOC/DOCX, images, CSV/JSON, brand kits, decks, game rules, art/layer folders, existing metadata and related project material.
2. **Tell NEURO About It** — conversational intake in plain language.
3. **Build It Step by Step** — one conversational/visual decision at a time. This must never degrade into a traditional multi-field form.

All three paths converge on the same canonical project state.

## Upload-first pipeline

```text
UPLOAD
  -> INGEST MEMBRANE
  -> FILE INVENTORY
  -> SAFE EXTRACTION / CLASSIFICATION
  -> PROJECT FACT EXTRACTION
  -> ASSET / BRAND / RULE / RIGHTS / ECONOMIC DISCOVERY
  -> PROVENANCE + CONFIDENCE
  -> INITIAL PROJECT STATE
  -> NEURO REVIEW
  -> ASK ONLY WHAT IS MISSING, CONFLICTED, OR REQUIRES HUMAN AUTHORITY
```

Uploads are untrusted input. Intake must quarantine/archive originals, reject unsafe paths/executables where appropriate, enforce size/type policy, preserve source provenance, and never treat instructions embedded in uploaded documents as execution authority.

## Example ZIP

```text
project.zip
  brand/
    logo.png
    brand-guide.pdf
  art/
    backgrounds/
    characters/
    accessories/
  pitch-deck.pptx
  game-rules.pdf
  traits.csv
  notes.docx
```

Holofoil inventories what exists and reports what it understands instead of asking the founder to re-enter it.

Example client summary:

```text
We found:
  Brand assets          FOUND
  147 art files         FOUND
  Pitch deck            FOUND
  Game rules            FOUND
  Existing trait CSV    FOUND
  Rights document       MISSING
  Launch schedule       MISSING
```

## Canonical fact statuses

Every extracted or generated project fact carries status and provenance:

- `VERIFIED` — explicitly confirmed or supported by authoritative project evidence
- `FOUND` — extracted from supplied project material but not yet confirmed where confirmation matters
- `PROPOSED` — Holofoil/NEURO recommendation
- `MISSING` — required information not yet available
- `CONFLICT` — supplied sources disagree
- `APPROVAL_REQUIRED` — explicit authorized human decision required

Never silently resolve material conflicts.

Example:

```text
CONFLICT: collection supply
  pitch-deck.pptx -> 777
  launch-notes.pdf -> 1000

NEURO asks: Which supply should I use?
```

## Requirement ownership

Every launch requirement is classified as one of three types.

### AUTO

Holofoil or specialist agents can resolve it without bothering the founder, subject to policy and verification.

Examples: dimensions, file integrity, duplicate detection, metadata generation, DNA validation, trait capacity, contract simulation, estimated network fees, screenshots and test results.

### REVIEW

Holofoil proposes; authorized client reviews/approves.

Examples: rarity distribution, public description, access allocation, launch schedule proposal and rights configuration.

### FOUNDER_ONLY

Cannot be inferred or silently generated.

Examples: IP ownership declaration, final price, material supply changes, financial authority, treasury ownership, legal rights grants and production launch approval.

## Guided step-by-step experience

The step-by-step route is a conversation, not a questionnaire.

Example:

```text
NEURO: What are we building?

[ NFT Collection ]
[ Trading Cards ]
[ Game Items ]
[ Membership ]
[ Digital Art ]
[ I'm not sure ]
```

Then:

```text
NEURO: Do you already have artwork?

[ Yes - upload it ]
[ Some of it ]
[ Not yet ]
```

Then only the next relevant decision.

Always offer `Help me decide` where a founder may reasonably need explanation or recommendation.

## Conversational project creation

A founder can describe an idea in plain language. NEURO converts that statement into proposed structured state and makes uncertainty visible.

Example founder statement:

> I want 333 robot cards where some are rare and people can battle with them.

Possible internal state:

```text
PROJECT_TYPE    TCG + COLLECTIBLE     PROPOSED
SUPPLY          333                   FOUND_FROM_CONVERSATION
ART             MISSING
GAME            REQUIRED             PROPOSED
RARITY          REQUESTED             FOUND_FROM_CONVERSATION
MINT            UNDECIDED
RIGHTS          UNDECIDED
```

NEURO asks only the next dependency-aware question.

## Internal Founder Launch Package

The existing Founder Launch Package remains useful as the canonical launch manifest/checklist, but Holofoil assembles it automatically from:

- uploads
- founder/team conversation
- approved decisions
- generated artifacts
- agent receipts
- test results
- launch configuration

The client does not manually fill it out.

## Project understanding

Holofoil may show a simple understanding/readiness summary without requiring 100% before useful work begins.

```text
PROJECT UNDERSTANDING

Brand        VERIFIED
Artwork      FOUND
Collection   VERIFIED
Game         PARTIAL
Rights       MISSING
Launch       MISSING
Team         VERIFIED
```

This is not a fake precision score. If a percentage is displayed, its calculation must be deterministic and explainable.

## Dependency-aware task generation

Missing information creates a task, not automatically a form field.

Example:

`Metadata missing` should become `Generate metadata after trait map approval` when Holofoil can generate it.

`Production contract missing` should become `Prepare production contract after testnet/security prerequisites` rather than asking the founder for a contract address.

## Founder-facing operating view

Default surface:

```text
PROJECT
Launch Readiness

NEURO
Your agents are working on:
- Trait validation
- Metadata preparation
- Testnet setup

NEEDS YOU
1 decision

[ Review decision ]

RECENTLY COMPLETED
- TCG configuration verified
- Collection capacity checked
- IP ownership recorded

[ View technical details ]
```

The founder sees outcomes, decisions and blockers. Technical evidence is available through progressive disclosure.

## Proof-of-work timeline

Verified work can feed the existing Holofoil work-proof video concept:

```text
agent task
  -> captured project artifact / approved screenshot
  -> verification
  -> receipt
  -> milestone
  -> NEURO summary
  -> composite client recap video
```

Never stage fake agent work or fake receipts. Never expose credentials, secrets, private keys, sensitive logs, private prompts or chain-of-thought.

## Hood Terps reference implementation

HOOD TERPS is the first beta/reference client for this intake engine.

For Hood Terps, the system should ingest existing repo/project evidence first, populate known state, preserve `MOCK` / `DRAFT` labels, detect missing production approvals, and ask only unavoidable human decisions.

Hood Terps owns its IP. Holofoil owns the reusable intake/service capability.

## Architecture boundary

```text
NEW CLIENT
  -> Holofoil Intake
       |-> Upload
       |-> Tell NEURO
       `-> Guided Step-by-Step
  -> Ingest Membrane
  -> Canonical Project State / provenance
  -> NEURO Holofoil Concierge
  -> Missing/conflict resolution
  -> Founder + Team workspace
  -> Holofoil Service Buffet
  -> Specialist agents
  -> Receipts / evidence
  -> Testnet / security gates
  -> Final authorized approval
  -> Production launch
```

NEURO is the concierge identity. Do not create a second concierge agent.

## Governance

Preserve:

`Identity -> Mandate -> Plan -> Execute -> Receipt -> Audit`

and for tool authority:

`Identity -> Mandate -> Policy -> Tool Permission -> Execution -> Receipt -> Audit`

Uploaded files, extracted text, project chat and agent recommendations never grant execution authority by themselves.

## Standing rule

> The founder talks to NEURO. NEURO builds the Holofoil launch package behind the curtain.

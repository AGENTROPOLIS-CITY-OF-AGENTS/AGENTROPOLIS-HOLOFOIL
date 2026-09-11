# HOLOFOIL TCG + Leaderboard UI Integration

Status: APPROVED PRESENTATION ARCHITECTURE

## Prime rule

**PRESENTATION FOLLOWS TRUTH.**

These UI components are presentation surfaces only. They do not determine game outcomes, rankings, rewards, legality, ownership, finance, or authority.

For Cultivar Clash and other TCG consumers:

```text
HOOD TERPS deterministic rules engine
  -> committed game state / result
  -> leaderboard or match projection
  -> HOLOFOIL presentation layer
  -> animation / 3D / hover / spotlight / recap
```

If a result is not committed by the authoritative rules or ranking source, HOLOFOIL must not present it as final.

## Component map

### Tier List Maker
Source install target:
`https://21st.dev/r/laziekiki/tier-list-maker`

Use for:
- community or editorial power rankings
- deck archetype tiers
- card / Resident / cultivar meta boards
- player-created ranking boards
- season recap "S/A/B/C" style views

Do **not** use as the authoritative competitive leaderboard. Official standings must come from committed match/ranking data. Label user/editorial tier boards distinctly from official standings.

### Interactive List Preview
Source install target:
`https://21st.dev/r/hyperiux/interactive-list-preview`

Use for:
- official leaderboard rows
- tournament / room roster
- match queue
- recent match history
- round / action recap
- deck list inspection
- event schedule and bracket-side lists

Rows may open deeper HOLOFOIL previews, but must only reveal information the current viewer is allowed to observe.

### Link Preview
Source install target:
`https://21st.dev/r/aghasisahakyan1/link-preview`

Use for:
- shared match-replay links
- rules/manual references
- card / collection / tournament links
- verified artifact or receipt references
- community posts that point into a match, card, season, or event

External metadata previewing must be sanitized and should not become an unrestricted server-side fetch path.

### Hover Preview
Source install target:
`https://21st.dev/r/minhxthanh/hover-preview`

Use for:
- quick card art/details on hover
- deck list card peeks
- player profile / rank peeks
- Resident / cultivar previews
- matchup history previews

For competitive play, hover previews must respect legally observable state. Hidden opponent cards, private deck contents, unrevealed RNG, or privileged agent state must never leak through preview UI.

### Scroll Expansion Hero
Source install target:
`https://21st.dev/r/arunachalam/scroll-expansion-hero`

Use for:
- season landing page
- tournament finals intro
- post-match cinematic recap
- featured champion / winning deck story
- pack / set reveal landing experience

Do not place it in the deterministic turn-resolution path. It is a cinematic wrapper, not game state.

The user supplied this install command twice; install it once.

### Spline Scene (`splite`)
Source install target:
`https://21st.dev/r/serafimcloud/splite`

Potential use:
- 3D battle-table shell
- exhibition room
- card stage
- trophy / leaderboard podium scene

**Local-first restriction:** the current HOLOFOIL implementation already has Three.js, React Three Fiber, and Drei. Prefer the existing HOLOFOIL 3D stack for production instead of introducing a new Spline runtime or externally hosted Spline scene. If the Spline component is evaluated, it must not introduce a production dependency on hosted Spline assets. Self-host/export or reproduce the presentation with existing Three.js infrastructure.

### Spotlight Card
Source install target:
`https://21st.dev/r/jahed/spotlight-card`

Use for:
- featured leaderboard leaders
- MVP / champion card
- active player selection
- rare / legendary reveal emphasis
- featured deck, Resident, or cultivar
- match result highlight

Pointer tracking is presentation only. Touch and reduced-motion fallbacks must preserve the same meaning without hover effects.

### Animated Feature Spotlight 3D
Source install target:
`https://21st.dev/r/ruixen.ui/animated-feature-spotlight3d`

Use for:
- featured champion or leaderboard leader hero
- match winner reveal after the authoritative result is committed
- featured Resident / cultivar / card showcase
- tournament finals spotlight
- premium Holofoil product or set reveal

This component is an emphasis layer only. It may visualize committed truth but may not determine or imply uncommitted game state. GPU/mobile and reduced-motion fallbacks are required before promotion.

### Feature Card 1
Source install target:
`https://21st.dev/r/ravikatiyar162/feature-card-1`

Use for:
- TCG format selection
- Holofoil service/capability explanation
- deck archetype or mode callouts
- game onboarding modules
- Creator-facing capability cards

Do not use generic feature-card grids as a substitute for information architecture. Each surface still needs a clear dominant action.

### Feature
Source install target:
`https://21st.dev/r/moazamtrade/feature`

Use for:
- progressive service discovery
- TCG feature explanation
- match-mode or leaderboard capability onboarding
- Holofoil/Creator product education

Use progressive disclosure rather than exposing every Holofoil or Agentropolis subsystem at once.

## Recommended TCG surfaces

### `/play`
Use:
- Hover Preview for legal card/deck peeks
- Spotlight Card for active/selected cards
- Interactive List Preview for battle log / observable action history
- Animated Feature Spotlight 3D only for non-blocking committed-result or featured-card presentation
- HOLOFOIL native Three.js for table, card flip, foil, refraction and committed-result animation

Avoid:
- Tier List Maker inside live turn resolution
- Scroll Expansion Hero inside match loop
- Spline as a required runtime dependency

### `/leaderboard`
Use:
- Interactive List Preview as the official standings shell
- Spotlight Card for top 3 / featured player
- Animated Feature Spotlight 3D for champion/finals presentation after ranking truth is committed
- Hover Preview for profile / deck / match summary peeks
- Link Preview for replay / season / rules references
- Tier List Maker as a separate "Meta Board" or community/editorial ranking tab

### `/meta`
Use:
- Tier List Maker for deck / card / Resident / cultivar meta tiers
- Hover Preview for item details
- Spotlight Card for trending / featured item
- Feature Card 1 for archetype, format, or season explainers when useful

### `/recap`
Use:
- Scroll Expansion Hero for cinematic match or season recap
- Animated Feature Spotlight 3D for winner/champion focus
- Link Preview for source artifacts / replay links
- Spotlight Card for winner / milestone callouts
- HOLOFOIL native 3D for committed card and table presentation

### `/discover` and onboarding
Use:
- Feature Card 1 for concise capability or format choices
- Feature for progressive disclosure of game and Holofoil features
- Hover Preview for fast context without navigation overhead

## Ownership boundaries

- HOOD TERPS = game rules, card data, Residents, lore, formats
- ARCANA-54 = reusable room/session orchestration, matchmaking, progression adapters
- BOTBAE = rules-aware opponent through adapter only; receives legally observable state
- HOLOFOIL = 3D cards, physical battle-table presentation, foil, flips, reveal, leaderboard presentation
- ORIGIN ENGINE = PSP + approved asset/metadata production
- GREENRAILS / Rust = inactive for FREE + MOCK gameplay

## Installation target

The canonical HOLOFOIL contract repository is `AGENTROPOLIS-HOLOFOIL`.

The current React/Vite implementation surface is `AGENTROPOLIS-HOLOFOIL2`, which already contains React 19, Vite, Tailwind, Motion, Three.js, React Three Fiber and Drei.

The 21st/shadcn components should be installed into the React implementation worktree, not into the contract-only repository. Before running registry installs, initialize/verify shadcn configuration in that implementation worktree and inspect the generated source before commit.

21st.dev is an installation/source registry only. Once accepted, component source belongs in the repository; production must not depend on 21st.dev being online.

## Acceptance checks

- official leaderboard uses authoritative committed ranking data
- tier boards are visibly labeled community/editorial/meta unless backed by official ranking authority
- hidden competitive state cannot leak through hover/link/list previews
- reduced-motion and touch paths preserve meaning
- spotlight effects do not encode authority or win state by color/effect alone
- animated 3D emphasis only reflects committed state
- feature-card layouts preserve clear information architecture and one dominant action per view
- Spline is not a mandatory production dependency
- no wallet, mint, token, contract, USDC or financial behavior is introduced by these UI components
- HOLOFOIL animation occurs after deterministic result commit

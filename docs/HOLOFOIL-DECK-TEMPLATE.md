# HOLOFOIL Deck Template

Status: CANONICAL SHARED PRESENTATION TEMPLATE  
Owner: AGENTROPOLIS-HOLOFOIL

## Purpose

All Gaming District games that consume HOLOFOIL SHOULD use the same collectible interaction shell.

Games provide content and authoritative game state.

HOLOFOIL provides:
- FAN
- STACK
- GRID
- LIST
- INSPECT
- foil/refraction/shimmer presentation
- responsive card navigation
- keyboard/swipe behavior
- reduced-motion behavior
- shared collectible accessibility

## Canonical hierarchy

AGENTROPOLIS Design System
-> Gaming District Design System
-> HOLOFOIL
-> HolofoilDeck
-> consuming game

Consumers include BLOCKBANGERS, PENGUIN ARCADE TCG, HOOD TERPS, ARCANA54, NEURO HEIST, and future games.

## Signature FAN mode

The default FAN mode uses up to seven visible cards with the active card centered, side cards progressively rotated/scaled, and swipe/arrow-key navigation.

Reference defaults:
- maxVisible: 7
- total spread: 42 degrees
- perspective: 1100px
- active scale: 1
- edge floor scale: 0.775

## Layout semantics

- FAN: signature collectible showcase
- STACK: deck/hand metaphor
- GRID: collection browser
- LIST: accessible information-dense mode
- INSPECT: single-card examination

These are presentation modes. They do not alter game state.

## Authority boundary

The consuming game remains authoritative for:
- gameplay
- stats
- deck legality
- rarity truth
- ownership truth
- rewards
- ranking
- economic settlement

HOLOFOIL remains authoritative for presentation only.

Presentation follows committed game truth.

## Dependencies

The React implementation in `src/components/deck/HolofoilDeck.tsx` expects:
- React
- framer-motion
- lucide-react
- Tailwind-compatible utility classes in the host surface

The repository is currently a protocol/component source repository rather than a standalone app package. Host games install the runtime dependencies.

## Adoption

A game imports the shared card contract and deck shell, then supplies card data or a custom renderer.

```tsx
<HolofoilDeck
  cards={gameCards}
  defaultLayout="fan"
/>
```

Game-specific art and mechanics MAY differ.

The HOLOFOIL shell, navigation semantics, accessibility, and authority boundary MUST remain stable.

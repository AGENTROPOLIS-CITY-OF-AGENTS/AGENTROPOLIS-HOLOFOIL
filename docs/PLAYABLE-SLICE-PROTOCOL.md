# HOLOFOIL × AGENTROPOLIS PSP

HOLOFOIL adopts the AGENTROPOLIS Playable Slice Protocol (PSP) as the repeatable proof contract for interactive collectible, card, pack-opening, tabletop, and game-facing experiences.

Canonical owner: AGENTROPOLIS Utility Grid → ORIGIN ENGINE → PSP.

HOLOFOIL is a consumer/integration surface, not a duplicate PSP implementation.

## HOLOFOIL PSP responsibilities

For a PSP package that uses HOLOFOIL, the slice may request deterministic presentation mechanics such as:

- foil/holographic card presentation
- card flip/reveal states
- pack-opening presentation
- rarity/reveal visualization
- physical/digital tabletop presentation
- deterministic collectible material states
- screenshot/recording proof states

HOLOFOIL must not silently add financial behavior. PSP financial boundaries remain authoritative. A MOCK/free slice must not mint, price, convert currency, request wallet signatures, call contracts, or issue financial receipts merely because HOLOFOIL is present.

## Reference

First reference consumer: `PSP-001 — HOOD TERPS: CULTIVAR CLASH`.

Expected PSP flow remains:

```text
Scope Lock
-> Build Loop
-> Reuse Existing Utilities
-> Agent Boundary
-> Fiscal Boundary
-> Proof Capture
-> Targeted Repair Pass
-> Receipt
```

HOLOFOIL contributes presentation capability inside the Build Loop and Proof Capture phases; it does not replace ORIGIN ENGINE governance or PSP acceptance criteria.

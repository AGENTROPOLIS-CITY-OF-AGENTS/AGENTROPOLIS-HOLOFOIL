# Holofoil — TL/PFP Collectible Consumption

## Role

Holofoil may consume authorized card, listicle, game, avatar, or story objects produced from `gaming.timeline-capsule.v1` and manifest them as governed collectible editions.

Holofoil does not convert mere visibility on a social timeline into ownership, copyright, commercial rights, revenue rights, or permission to mint.

## Consumption corridor

```text
TIMELINE-DERIVED OBJECT
  -> provenance check
  -> rights / authority check
  -> Holofoil manifestation job
       -> card frame
       -> deterministic foil/material treatment
       -> edition metadata
       -> reveal / unlock presentation
  -> preview / validation
  -> governed publish or mint request when authorized
  -> receipt
```

## Accepted candidate types

- authenticated user's own PFP character card
- listicle cover / edition card
- game achievement or run card
- timeline recap collectible candidate
- ARCANA54-authorized story object
- GDP-generated game object with applicable rights receipt

## Third-party PFP rule

A profile image appearing in timeline data is not an owned collectible asset by default.

Third-party PFPs may remain visible as attributed source evidence where permitted, but collectible or commercial derivative manifestation requires applicable rights authority.

## Metadata requirements

A timeline-derived Holofoil job should preserve:

- source capsule ID
- experience ID
- source post IDs where applicable
- source account attribution
- source asset URI or content hash where available
- transformation receipt
- rights receipt or explicit non-mint presentation status
- material schema version
- edition / serialization data when applicable

## No authority collapse

- Gaming District owns gameplay-facing contracts and receipts.
- ARCANA54 owns reusable media/story transformation patterns and continuity.
- GDP may produce the application/game output.
- Holofoil owns collectible composition, material treatment, edition metadata, and governed publish preparation.
- AGENTROPOLIS-GTM owns GTM distribution and attribution decisions.
- IP authority remains external to Holofoil and must be resolved through the applicable IP authority path.

## Safe default

If rights are unclear, Holofoil may render a non-commercial preview but must fail closed for mint, commercial derivative publication, or rights-sensitive distribution.

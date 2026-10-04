# Holder Claim Presentation Contract

HOLOFOIL may present a claimable in-game card after the Gaming District or an approved project verifier resolves holder entitlement.

## Boundary

```text
PROJECT NFT OWNERSHIP
  -> SERVER-SIDE VERIFICATION
  -> ENTITLEMENT
  -> GAME OBJECT GRANT
  -> HOLOFOIL PRESENTATION
```

HOLOFOIL does not:
- query wallets directly as an authority source
- decide NFT ownership
- mint new assets automatically
- determine game balance
- determine whether a card is transferable

## UI states

- NOT CONNECTED
- CHECKING OWNERSHIP
- ELIGIBLE
- ALREADY CLAIMED
- NOT ELIGIBLE
- CLAIM FAILED
- CLAIMED

The UI must never show ELIGIBLE from client state alone.

## Card claim surface

A project may expose a CTA such as:

`CLAIM IN-GAME CARD`

After verified claim:
- attach the game's authoritative card object
- render through the canonical HolofoilDeck/HolofoilSurface
- show claim receipt
- preserve project/game provenance

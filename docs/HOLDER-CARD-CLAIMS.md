# Holder Claim Presentation Contract

HOLOFOIL may present a claimable in-game card after the Gaming District or an approved project verifier resolves holder entitlement through Discord.

## Boundary

```text
PROJECT NFT OWNERSHIP
  -> PROJECT HOLDER VERIFICATION
  -> VERIFIED DISCORD ROLE
  -> DISCORD OAUTH / BOT ROLE CHECK
  -> AGENTROPOLIS PLAYER ID
  -> ENTITLEMENT
  -> GAME OBJECT GRANT
  -> HOLOFOIL PRESENTATION
```

HOLOFOIL does not:
- connect wallets
- query blockchain ownership directly
- decide Discord role eligibility
- mint new assets automatically
- determine game balance
- determine whether a card is transferable

## UI states

- SIGN IN WITH DISCORD
- CHECKING HOLDER STATUS
- ELIGIBLE
- ALREADY CLAIMED
- NOT ELIGIBLE
- VERIFICATION REQUIRED
- CLAIM FAILED
- CLAIMED

The UI must never show ELIGIBLE from client-supplied role state.

## Card claim surface

A project may expose:

`VERIFY WITH DISCORD`

then:

`CLAIM IN-GAME CARD`

After verified claim:
- attach the game's authoritative card object
- render through the canonical HolofoilDeck/HolofoilSurface
- show the claim receipt
- preserve project/game provenance

Discord is a holder credential bridge, not NFT ownership truth.

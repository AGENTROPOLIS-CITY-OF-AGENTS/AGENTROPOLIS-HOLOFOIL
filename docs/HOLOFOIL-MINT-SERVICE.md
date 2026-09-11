# Holofoil mint service

Holofoil owns mint/publish. HOOD TERPS is a client.

```
HOOD TERPS  →  HolofoilMintClient  →  Holofoil mint service  →  chain adapter  →  receipt
```

Contracts: `src/contracts/mint.v1.ts`

The service never invents transaction hashes, token IDs, contract addresses, or live scarcity. Unverified collections stay `SIMULATION` / `BLOCKED`.

Embeddable service UI: `/embed/mint` (not a HOOD TERPS skin).

HOOD TERPS branded panel lives in `AGENTROPOLIS-CITY-OF-AGENTS/HOOD-TERPS` and lazy-loads only after `/mint`.

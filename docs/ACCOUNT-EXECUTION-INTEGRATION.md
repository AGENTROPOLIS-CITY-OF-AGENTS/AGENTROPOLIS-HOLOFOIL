# Holofoil Account Execution Integration

Status: compatibility / reconciliation contract

This branch must remain aligned with the canonical provider-neutral Account Execution Layer now defined in AGENTROPOLIS-ARC and wired into canonical HOLOFOIL.

## Canonical flow

```text
AGENT-ENTITY
      |
      v
FISCALITH
      |
      v
AEGIS
      |
      v
EXECUTION ENVELOPE
      |
      v
PAYRAIL
      |
      v
ACCOUNT EXECUTION
      |-- MetaMask Smart Account
      |-- Circle
      |-- native EOA (bounded fallback / test)
      `-- future providers
      |
      v
CHAIN ADAPTER
      |-- ARC
      |-- Robinhood Chain
      |-- Base
      |-- XRPL
      `-- others
      |
      v
FINALITY
      |
      v
HOLOFOIL RECEIPT / HOLDER VAULT
```

## Boundary

Holofoil may compile metadata, present collectible state, request governed mint/transfer execution, ingest confirmed receipts, and render Holder Vault ownership.

Holofoil must not turn collectible ownership into signing authority.

```text
NFT OWNERSHIP
!= ACCOUNT AUTHORITY
!= TREASURY CONTROL
!= SERVICE-RIGHT AUTHORITY
!= SETTLEMENT APPROVAL
```

Provider permissions must remain equal to or narrower than AGENTROPOLIS policy.

```text
ACCOUNT_PROVIDER_PERMISSION
    subset-of
EXECUTION_ENVELOPE
    subset-of
SERVICE_RIGHT
    subset-of
MANDATE
```

No private keys, seed phrases, passkey secrets, session signing secrets, provider API secrets, or unrestricted bearer tokens may be written to Holofoil metadata, receipts, logs, configs, or repositories.

The canonical implementation lives in the IP-clean HOLOFOIL integration lane. This branch must not create a competing authority model.

# HOLOFOIL Business Capability Credential Seam

Status: CANONICAL DRAFT

## Rule

HOLOFOIL visualizes verified business capability state. It does not create legal identity, provider credentials, banking authority, tax status, or autonomous permission.

```text
HOUSE54 capability state
  -> Ontology identity/provenance
  -> AEGIS authority decision
  -> signed capability/receipt reference
  -> HOLOFOIL presentation binding
  -> ARCANA54 gameplay binding
```

## Why HOLOFOIL connects

The solopreneur TCG needs a visible, collectible representation of what an AGENTIC-ENTITY has actually established and earned.

HOLOFOIL may render:

- business communications credential
- entity formation milestone
- EIN/tax identity milestone
- banking readiness
- D-U-N-S / business credit identity
- CRM / invoicing readiness
- compliance / insurance readiness
- governed autonomy tier

## Hard boundary

A card is evidence-linked presentation, never permission.

These statements are always false:

- card ownership means the holder has a bank account
- foil rarity grants email send authority
- NFT metadata contains passwords, EINs, SSNs, API secrets, or bank credentials
- gameplay rank bypasses AEGIS
- visual status overrides HOUSE54 or Ontology state

## Credential card model

Suggested public-safe fields:

```ts
type BusinessCapabilityCard = {
  schema: "agentropolis.holofoil.business-capability.v1";
  agenticEntityId: string;
  capabilityId: string;
  displayName: string;
  state: "LOCKED" | "READY" | "VERIFIED" | "SUSPENDED" | "REVOKED";
  authorityTier: "NONE" | "DRAFT_ONLY" | "APPROVAL_REQUIRED" | "LIMITED_AUTO";
  evidenceRef?: string;
  receiptRef?: string;
  issuedAt?: string;
  expiresAt?: string;
};
```

No secret material is permitted.

## Example: communications card

HERMES MAIL NODE
- Dedicated agent inbox
- provider-neutral Email Agent Interface
- draft/review workflow
- scoped send authority
- audit receipts

The provider may be HermesMailAgent, AgentMail, Cloudflare Agentic Inbox, Gmail/Workspace, or a future adapter.

## State transitions

```text
LOCKED
  -> READY
  -> VERIFIED
  -> SUSPENDED
  -> VERIFIED

VERIFIED
  -> REVOKED
```

HOLOFOIL mirrors the state. It does not decide the state.

## TCG integration

ARCANA54 may turn verified capability cards into education and progression mechanics.

Example:
- VERIFY BUSINESS EMAIL -> unlock Communication Infrastructure card
- COMPLETE ENTITY WORKFLOW -> unlock Entity Forge card
- VERIFY D-U-N-S PROFILE -> unlock Business Reputation card

Real-world authority still flows through AEGIS and Execution Envelopes.

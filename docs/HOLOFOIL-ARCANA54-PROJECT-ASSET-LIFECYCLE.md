# Holofoil + ARCANA54 Project Asset Lifecycle

## Canonical ownership boundary

Holofoil is the reusable reconstruction, trait-production, collectible-generation, packaging and delivery system.

ARCANA54 is the project/IP custody, provenance, canon and approved-asset vault layer.

A client project such as Hood Terps is NOT the owner of Holofoil reconstruction infrastructure and must not contain the reusable reconstruction engine as project architecture.

The project founder owns the project IP. Holofoil and ARCANA54 store/process that IP according to the project's authorized workflow. Neither system acquires project IP merely by processing or storing it.

## System flow

```text
FOUNDER / PROJECT INPUT
        |
        v
HOLOFOIL INGEST
        |
        +--> source classification + evidence preservation
        +--> ATG Transform / reconstruction
        +--> trait decomposition
        +--> canonical asset production
        +--> compatibility + quantitative QC
        +--> human approval gates
        |
        v
ARCANA54 PROJECT VAULT
        |
        +--> project identity
        +--> IP/canon records
        +--> source evidence
        +--> approved masters
        +--> provenance + version lineage
        +--> rights configuration
        +--> receipts
        |
        v
HOLOFOIL PRODUCTION
        |
        +--> collection generation
        +--> DNA / metadata
        +--> packaging
        +--> game / spatial / collectible outputs where authorized
        +--> launch/mint preparation where authorized
        |
        v
FOUNDER DELIVERY PACKAGE (.ZIP)
```

## Repository boundary

Project repositories may contain project-specific application/configuration code when needed, but Holofoil's reusable reconstruction engine, reconstruction contracts, canonical processing logic and reusable production pipelines belong in `AGENTROPOLIS-HOLOFOIL`.

Project IP assets are maintained through the Holofoil + ARCANA54 project workspace/vault model rather than making the client repository the architectural source of truth for reconstruction.

## Reconstruction workspace

Canonical Holofoil project workspace pattern:

```text
projects/<project_id>/
  intake/
    originals/
    reference_only/
    manifests/
  reconstruction/
    reference_cells/
    candidates/
    qc/
    receipts/
  canonical/
    traits/
    entities/
    metadata/
  delivery/
    preview/
    founder_zip/
```

ARCANA54 stores the corresponding project identity, canon, provenance, rights state, approved masters and receipt lineage.

## Epistemic truth

Every transformation preserves:

- OBSERVED
- RECOVERED
- INFERRED
- SYNTHESIZED

Reference images are evidence.
Reconstruction candidates are interpretations.
Approved canonical assets are project IP masters.
Delivery assets are founder-facing exports.

Never collapse these states.

## Approval and authority

Holofoil may reconstruct, validate and package project assets within an authorized execution envelope.

Holofoil does not independently grant IP rights, publish a collection, execute a financial transaction or mint production assets merely because reconstruction passed QC.

Human/project authority remains separate from transformation semantics.

## Founder delivery contract

At completion, Holofoil generates a founder delivery ZIP. The ZIP is an export of the approved project state, not the only copy or system of record.

Recommended package:

```text
<PROJECT>-FOUNDER-DELIVERY-v<version>.zip
  README.md
  LICENSE-AND-RIGHTS/
  SOURCE-MANIFEST/
  CANONICAL-ASSETS/
    traits/
    characters/
    collection/
  METADATA/
  GAME-AND-EXPERIENCE/        # when applicable
  MINT-AND-CHAIN/              # when applicable and authorized
  PROVENANCE/
    source-map.json
    asset-lineage.json
  RECEIPTS/
  QC/
  PREVIEWS/
```

The delivery manifest should include hashes for exported files so the founder can verify the package against the approved Holofoil/ARCANA54 project state.

## Hood Terps beta

Hood Terps is the beta/client project exercising this reusable system.

Hood Terps owns Hood Terps IP.
Holofoil owns the reusable reconstruction and collectible-production capability.
ARCANA54 stores Hood Terps project IP/canon/provenance/approved masters as the project vault layer.
The founder receives the final approved ZIP export.

Do not duplicate Holofoil reconstruction architecture inside the Hood Terps repository.

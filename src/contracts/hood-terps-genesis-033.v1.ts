export const HOOD_TERPS_GENESIS_033_VERSION = "holofoil.beta.hood-terps.genesis-033.v1" as const;

/**
 * Holofoil beta recipe for HOOD TERPS.
 * HOOD TERPS retains ownership of its brand, characters, traits and creative IP.
 * This recipe validates the reusable Holofoil factory. It grants no production mint authority.
 */
export const HOOD_TERPS_GENESIS_033 = {
  version: HOOD_TERPS_GENESIS_033_VERSION,
  client: "HOOD_TERPS",
  ipOwner: "HOOD_TERPS",
  platform: "HOLOFOIL",
  collectionSize: 33,
  environment: "TESTNET",
  chain: {
    name: "Robinhood Chain Testnet",
    chainId: 46630,
  },
  authority: {
    productionMint: false,
    publish: false,
    walletSigning: false,
    legalRightsGrant: false,
  },
  sourceReadiness: {
    finishedCharacterReferences: "AVAILABLE",
    traitTaxonomy: "READY",
    alignedTransparentLayers: "NOT_VERIFIED",
  },
  coverage: {
    presentations: ["male", "female"],
    terpColorways: ["lime-citrus", "purple-candy", "orange-tropical", "forest-earth", "black-gas"],
    eyeStylesRequired: ["classic", "glow", "sleepy", "x-eyes", "angry", "drip", "outline", "spiral"],
    mixedEyePairsRequired: true,
    bottomsRequired: ["low-rise-barrel", "terp-cloud-sweats", "couch-lock-sweats", "cargo-pants", "baggy-jeans", "parachute-pants"],
    footwearSilhouettesRequired: ["high-top-sneaker", "low-top-sneaker", "skate-shoe", "runner", "work-boot", "futuristic-sneaker"],
  },
  gates: [
    "SOURCE_ASSET_VERIFIED",
    "TRAITS_VALID",
    "COMPATIBILITY_VALID",
    "ART_QC_PASS",
    "DNA_UNIQUE",
    "METADATA_VALID",
    "FOUNDER_PREVIEW_APPROVED",
    "TESTNET_ONLY",
  ],
  artQc: {
    jointBluntGrip: "Joint or blunt must sit naturally between fingers; no floating, palm intersection, on-top placement, or finger-geometry intersection.",
  },
  pipeline: [
    "INGEST",
    "INVENTORY",
    "VALIDATE_LAYERS",
    "COMPOSE",
    "ART_QC",
    "DNA",
    "DEDUPLICATE",
    "METADATA",
    "PREVIEW",
    "MINT_PREPARE",
    "TESTNET_VERIFY",
    "RECEIPT",
  ],
} as const;

export type HoodTerpsGenesis033 = typeof HOOD_TERPS_GENESIS_033;

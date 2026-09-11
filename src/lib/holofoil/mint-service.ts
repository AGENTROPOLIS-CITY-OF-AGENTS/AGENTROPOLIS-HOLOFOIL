import {
  assertMintRequest,
  type HolofoilMintPreparationV1,
  type HolofoilMintReceiptV1,
  type HolofoilMintRequestV1,
} from "../../contracts/mint.v1.ts";

export interface HolofoilCollectionRecord {
  projectId: string;
  collectionId: string;
  name: string;
  chainId?: string;
  chainLabel: string;
  phaseId: string;
  phaseLabel: string;
  live: boolean;
  contract?: string;
  priceDisplay?: string;
  supply?: number;
  remaining?: number;
  maxPerCollector?: number;
  verified: boolean;
  source?: string;
}

/** Service-owned catalog. Unverified collections never present live scarcity. */
export const SERVICE_COLLECTIONS: readonly HolofoilCollectionRecord[] = [
  {
    projectId: "hood-terps",
    collectionId: "hood-terps:collection",
    name: "HOOD TERPS",
    chainLabel: "Robinhood Chain",
    phaseId: "public-draft",
    phaseLabel: "Public",
    live: false,
    maxPerCollector: 1,
    verified: false,
  },
];

export function lookupCollection(collectionId: string): HolofoilCollectionRecord | undefined {
  return SERVICE_COLLECTIONS.find((item) => item.collectionId === collectionId);
}

function requestId(req: HolofoilMintRequestV1): string {
  return `mint-${req.projectId}-${req.collectionId}-${req.quantity}`;
}

export function prepareMint(req: HolofoilMintRequestV1): HolofoilMintPreparationV1 {
  assertMintRequest(req);
  const collection = lookupCollection(req.collectionId);
  if (!collection || collection.projectId !== req.projectId) {
    return {
      version: "1.0.0",
      requestId: requestId(req),
      eligibility: "INELIGIBLE",
      quantity: req.quantity,
      chainLabel: "unconfigured",
      simulation: { status: "BLOCKED", note: "Collection is not registered with Holofoil." },
      transactionRequest: null,
      approvalState: "BLOCKED",
      state: "INELIGIBLE",
      verifiedFields: [],
      draftFields: ["collection"],
    };
  }

  if (!req.recipient) {
    return {
      version: "1.0.0",
      requestId: requestId(req),
      eligibility: "WALLET_REQUIRED",
      quantity: req.quantity,
      mintPrice: collection.priceDisplay,
      chainId: collection.chainId,
      chainLabel: collection.chainLabel,
      simulation: {
        status: "SIMULATION",
        note: "Wallet is only required to mint. Browse remains wallet-free.",
      },
      transactionRequest: null,
      approvalState: "NONE",
      state: "WALLET_REQUIRED",
      verifiedFields: collection.verified ? ["collection"] : [],
      draftFields: collection.verified ? [] : ["price", "supply", "contract"],
    };
  }

  if (!collection.live || !collection.verified || !collection.contract) {
    return {
      version: "1.0.0",
      requestId: requestId(req),
      eligibility: "PHASE_CLOSED",
      quantity: req.quantity,
      mintPrice: collection.priceDisplay,
      estimatedNetworkFee: "ESTIMATE unavailable until a live adapter is attached",
      chainId: collection.chainId,
      chainLabel: collection.chainLabel,
      simulation: {
        status: "SIMULATION",
        note: "Mint is not live. Holofoil simulated the request. No transaction was prepared and no token IDs were invented.",
      },
      transactionRequest: null,
      approvalState: "BLOCKED",
      state: "SIMULATING",
      verifiedFields: [],
      draftFields: ["price", "supply", "contract", "phase"],
    };
  }

  return {
    version: "1.0.0",
    requestId: requestId(req),
    eligibility: "ELIGIBLE",
    quantity: req.quantity,
    mintPrice: collection.priceDisplay,
    estimatedNetworkFee: "ESTIMATE",
    totalEstimate: collection.priceDisplay,
    contract: collection.contract,
    chainId: collection.chainId,
    chainLabel: collection.chainLabel,
    simulation: { status: "READY", note: "Ready for governed execution." },
    transactionRequest: null,
    approvalState: "REQUIRED",
    state: "APPROVAL_REQUIRED",
    verifiedFields: ["collection", "contract", "phase"],
    draftFields: [],
  };
}

export function mintReceiptFromPrep(
  req: HolofoilMintRequestV1,
  prep: HolofoilMintPreparationV1,
): HolofoilMintReceiptV1 {
  if (prep.state === "CONFIRMED") {
    throw new Error("HOLOFOIL_MINT_CONFIRMED_WITHOUT_CHAIN");
  }
  return {
    version: "1.0.0",
    requestId: prep.requestId,
    projectId: req.projectId,
    collectionId: req.collectionId,
    chainId: prep.chainId,
    status: prep.approvalState === "BLOCKED" ? "BLOCKED" : "SIMULATED",
    note: prep.simulation.note,
  };
}

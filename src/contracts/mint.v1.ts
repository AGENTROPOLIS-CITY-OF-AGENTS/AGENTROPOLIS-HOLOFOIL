export type HolofoilMintState =
  | "IDLE"
  | "LOADING"
  | "WALLET_REQUIRED"
  | "VALIDATING"
  | "INELIGIBLE"
  | "SIMULATING"
  | "APPROVAL_REQUIRED"
  | "READY"
  | "SIGNING"
  | "SUBMITTING"
  | "CONFIRMING"
  | "CONFIRMED"
  | "FAILED";

export interface HolofoilMintRequestV1 {
  version: "1.0.0";
  projectId: string;
  collectionId: string;
  quantity: number;
  recipient?: string;
  phaseId?: string;
  chainId?: string;
}

export interface HolofoilMintSimulationV1 {
  status: "SIMULATION" | "BLOCKED" | "READY";
  note: string;
}

export interface HolofoilProvisioningV1 {
  provider: "AGENTROPOLIS-AQUADUCT";
  mode: "EXTERNAL_FAUCET";
  network: string;
  asset: string;
  url: string;
  note: string;
}

export interface HolofoilMintPreparationV1 {
  version: "1.0.0";
  requestId: string;
  eligibility: "ELIGIBLE" | "INELIGIBLE" | "WALLET_REQUIRED" | "PHASE_CLOSED";
  quantity: number;
  mintPrice?: string;
  estimatedNetworkFee?: string;
  totalEstimate?: string;
  contract?: string;
  chainId?: string;
  chainLabel: string;
  provisioning?: HolofoilProvisioningV1;
  simulation: HolofoilMintSimulationV1;
  transactionRequest: null | Record<string, unknown>;
  approvalState: "NONE" | "REQUIRED" | "BLOCKED";
  state: HolofoilMintState;
  verifiedFields: string[];
  draftFields: string[];
}

export interface HolofoilMintReceiptV1 {
  version: "1.0.0";
  requestId: string;
  projectId: string;
  collectionId: string;
  chainId?: string;
  transactionHash?: string;
  tokenIds?: string[];
  metadataRefs?: string[];
  provenanceRefs?: string[];
  confirmedAt?: string;
  status: "SIMULATED" | "BLOCKED" | "CONFIRMED" | "FAILED";
  note: string;
}

export function assertMintRequest(req: HolofoilMintRequestV1): void {
  if (req.version !== "1.0.0") throw new Error("HOLOFOIL_MINT_VERSION_UNSUPPORTED");
  if (!req.projectId || !req.collectionId) throw new Error("HOLOFOIL_MINT_IDENTITY_REQUIRED");
  if (!Number.isInteger(req.quantity) || req.quantity < 1 || req.quantity > 20) {
    throw new Error("HOLOFOIL_MINT_QUANTITY_INVALID");
  }
}

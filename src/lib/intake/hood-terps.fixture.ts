import { ROBINHOOD_TESTNET } from "../../contracts/founder-intake.v1.ts";
import type { FounderProjectV1 } from "./store.ts";
import { assemblePackage } from "./package.ts";

/** Beta client seed. HOOD TERPS owns HOOD TERPS IP. Holofoil does not. */
export function hoodTerpsSeed(): FounderProjectV1 {
  const projectId = "hood-terps";
  const facts = [
    fact("name", "HOOD TERPS", "VERIFIED", "CLIENT_REPO", "FOUNDER_ONLY"),
    fact("projectType", "TRADING_CARDS", "FOUND", "CLIENT_REPO", "REVIEW"),
    fact("ipOwner", "AGENTROPOLIS-CITY-OF-AGENTS/HOOD-TERPS", "VERIFIED", "CLIENT_REPO", "FOUNDER_ONLY"),
    fact("artwork", "UNPRODUCED", "MISSING", "CLIENT_REPO", "AUTO"),
    fact("game", "Cultivar Clash", "FOUND", "CLIENT_REPO", "REVIEW"),
    fact("mint", "OFF", "VERIFIED", "CLIENT_REPO", "FOUNDER_ONLY"),
    fact("testnet", `${ROBINHOOD_TESTNET.label} ${ROBINHOOD_TESTNET.chainId}`, "DRAFT", "SYSTEM", "REVIEW"),
    fact("chain", "Robinhood Chain", "FOUND", "CLIENT_REPO", "REVIEW"),
  ];
  return {
    version: "1.0.0",
    projectId,
    workspaceId: "workspace-hood-terps",
    name: "HOOD TERPS",
    path: "HOOD_TERPS_SEED",
    facts,
    inventory: [],
    events: [
      {
        id: "evt-seed",
        at: "1970-01-01T00:00:00.000Z",
        label: "Ingested HOOD TERPS client evidence. IP remains with HOOD TERPS. Mint stays OFF.",
        agentLabel: "HOLOFOIL",
        state: "VERIFIED",
      },
    ],
    services: ["DROP_CREATION", "COLLECTION_GENERATION", "TCG_GAME_SERVICES"],
    launchPackage: assemblePackage(projectId, facts),
    holofoilOwnsIp: false,
    ipOwnerLabel: "AGENTROPOLIS-CITY-OF-AGENTS/HOOD-TERPS",
  };
}

function fact(
  key: string,
  value: string,
  status: "VERIFIED" | "FOUND" | "MISSING" | "DRAFT",
  sourceKind: "CLIENT_REPO" | "SYSTEM",
  ownership: "AUTO" | "REVIEW" | "FOUNDER_ONLY",
) {
  return {
    id: `ht-${key}`,
    key,
    value,
    status,
    sourceRef: "AGENTROPOLIS-CITY-OF-AGENTS/HOOD-TERPS",
    sourceKind,
    confidence: status === "VERIFIED" ? 1 : 0.5,
    ownership,
    updatedAt: "1970-01-01T00:00:00.000Z",
  };
}

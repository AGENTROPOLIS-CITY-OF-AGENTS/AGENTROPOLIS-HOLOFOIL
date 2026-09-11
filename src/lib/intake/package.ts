import type {
  FactStatus,
  FounderLaunchPackageV1,
  ProjectFactV1,
} from "../../contracts/founder-intake.v1.ts";
import { LAUNCH_PACKAGE_VERSION } from "../../contracts/founder-intake.v1.ts";
import type { HolofoilServiceId } from "../../contracts/service-enrollment.v1.ts";
import { factValue } from "./guided.ts";

const DOMAINS = [
  "founderIdentity",
  "projectIdentity",
  "ipOwnership",
  "team",
  "artwork",
  "traits",
  "metadata",
  "gameUtility",
  "rights",
  "launchPhases",
  "pricing",
  "supply",
  "chain",
  "testnet",
  "marketplace",
  "approvals",
] as const;

function statusOf(facts: ProjectFactV1[], key: string, fallback: FactStatus = "MISSING"): FactStatus {
  const hit = facts.find((f) => f.key === key);
  if (!hit) return fallback;
  return hit.status;
}

export function assemblePackage(projectId: string, facts: ProjectFactV1[]): FounderLaunchPackageV1 {
  return {
    version: LAUNCH_PACKAGE_VERSION,
    projectId,
    founderIdentity: statusOf(facts, "founder"),
    projectIdentity: statusOf(facts, "name", statusOf(facts, "projectType")),
    ipOwnership: statusOf(facts, "ipOwner"),
    team: statusOf(facts, "team", "DRAFT"),
    artwork: statusOf(facts, "artwork"),
    traits: statusOf(facts, "traits"),
    metadata: statusOf(facts, "metadata"),
    gameUtility: statusOf(facts, "game"),
    rights: statusOf(facts, "rightsIntent"),
    launchPhases: statusOf(facts, "destination"),
    pricing: statusOf(facts, "price", "MISSING"),
    supply: statusOf(facts, "supply"),
    chain: statusOf(facts, "chain"),
    testnet: statusOf(facts, "testnet"),
    marketplace: statusOf(facts, "marketplace"),
    approvals: statusOf(facts, "approvals"),
  };
}

function score(status: FactStatus): number {
  if (status === "VERIFIED") return 1;
  if (status === "FOUND") return 0.5;
  if (status === "PROPOSED" || status === "DRAFT") return 0.25;
  return 0;
}

export function readinessPercent(pkg: FounderLaunchPackageV1): { percent: number; explain: string } {
  const values = DOMAINS.map((key) => pkg[key]);
  const total = values.reduce((sum, status) => sum + score(status), 0);
  const percent = Math.round((total / DOMAINS.length) * 100);
  const verified = values.filter((s) => s === "VERIFIED").length;
  return {
    percent,
    explain: `${verified}/${DOMAINS.length} domains verified. FOUND counts as half. PROPOSED/DRAFT a quarter. CONFLICT/MISSING add zero.`,
  };
}

export function nextFounderAction(facts: ProjectFactV1[]): { label: string; reason: string } {
  const conflict = facts.find((f) => f.status === "CONFLICT" && f.sourceKind === "SYSTEM");
  if (conflict) {
    return {
      label: "Resolve conflict",
      reason: `I found two different values for ${conflict.key}. Which should I use? ${conflict.value}. Sources: ${conflict.sourceRef}`,
    };
  }
  if (!factValue(facts, "ipOwner")) {
    return { label: "Declare IP ownership", reason: "IP ownership is founder-only. Holofoil will not assume it." };
  }
  if (!factValue(facts, "artwork")) {
    return { label: "Add artwork or say not yet", reason: "Collection work can start, but generation waits on art or an explicit not-yet." };
  }
  if (!factValue(facts, "supply")) {
    return { label: "Confirm collection size", reason: "Supply is a review decision. Holofoil will not invent scarcity." };
  }
  return { label: "Review launch package", reason: "Core facts are present. Open details only if you want the machinery." };
}

export function relevantServices(facts: ProjectFactV1[]): HolofoilServiceId[] {
  const type = factValue(facts, "projectType") ?? "";
  const ids: HolofoilServiceId[] = ["DROP_CREATION", "COLLECTION_GENERATION"];
  if (factValue(facts, "artwork") === "UNPRODUCED" || factValue(facts, "artwork") === "FOUND") {
    ids.push("RECONSTRUCT_ASSETS");
  }
  if (/TRADING|GAME|TCG/.test(type) || factValue(facts, "game")) ids.push("TCG_GAME_SERVICES");
  if (factValue(facts, "community")) ids.push("LIVE_SESH_SOCIAL_GAMES");
  if (factValue(facts, "rightsIntent")) ids.push("IP_EQUITY_ENGINE");
  if (factValue(facts, "destination") === "WEB3" || factValue(facts, "destination") === "HYBRID") {
    ids.push("MINT_SERVICE");
  }
  return ids;
}

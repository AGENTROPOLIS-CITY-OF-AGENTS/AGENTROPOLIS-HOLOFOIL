import type { DropModeReceiptV1, HolofoilDropModeV1 } from "../../contracts/drop-mode.v1.ts";
import {
  deriveRemaining,
  instantiateLaunchRecipe,
  phaseStatus,
  type LaunchRecipeId,
} from "./launch.ts";
import type { WorkspaceState } from "./types.ts";

const ACCESS_COPY: Record<string, string> = {
  PUBLIC: "Everyone at once",
  COMMUNITY: "My community first",
  INVITE_ONLY: "Invite-only first",
  HOLDERS: "Existing holders",
  CUSTOM: "Custom audience",
};

export function easyAccessLabel(audience: string): string {
  return ACCESS_COPY[audience] ?? ACCESS_COPY.CUSTOM;
}

export function deriveDrop(state: WorkspaceState, now = new Date()): HolofoilDropModeV1 {
  const launch = state.launch ?? instantiateLaunchRecipe("SIMPLE_DROP");
  const phases = launch.phases.map((phase) => ({ ...phase, status: phaseStatus(phase, now) }));
  const livePhase = phases.find((p) => p.status === "LIVE");
  const upcoming = phases.find((p) => p.status === "UPCOMING");
  const verified = Boolean(state.dropVerified);
  const remaining = deriveRemaining({
    supply: state.job.project.requestedSupply,
    created: state.generated.length || undefined,
    verified,
    source: verified ? "holofoil-engine" : undefined,
  });

  let primaryAction: HolofoilDropModeV1["primaryAction"] = "NONE";
  if (livePhase && verified) primaryAction = "COLLECT";
  else if (upcoming) primaryAction = "NOTIFY_ME";
  else if (livePhase) primaryAction = "NOTIFY_ME";

  const soldOut = verified && remaining === 0;
  const ended = phases.length > 0 && phases.every((p) => p.status === "ENDED");

  return {
    version: "1.0.0",
    projectId: state.job.jobId,
    collectionName: state.job.project.name,
    state: soldOut ? "SOLD_OUT" : ended ? "ENDED" : livePhase && verified ? "LIVE" : launch.phases.some((p) => p.startsAt) ? "UPCOMING" : "DRAFT",
    destination: state.destination === "WEB3" ? "WEB3" : "WEB2_ONLY",
    networkLabel: state.destination === "WEB3" ? "Unconfigured" : undefined,
    launch,
    progress: {
      supply: state.job.project.requestedSupply,
      created: state.generated.length || undefined,
      remaining: verified ? remaining : undefined,
      verified,
      source: verified ? "holofoil-engine" : undefined,
    },
    primaryAction: soldOut ? "VIEW_COLLECTION" : ended ? "VIEW_COLLECTION" : primaryAction,
    marketplaceRoutes: state.marketplaceRoutes.filter((r) => r.verified),
  };
}

export function dropReceipt(drop: HolofoilDropModeV1): DropModeReceiptV1 {
  return {
    version: "1.0.0",
    projectId: drop.projectId,
    generatedAt: new Date().toISOString(),
    state: drop.state,
    verifiedFields: drop.progress.verified ? ["supply"] : [],
    draftFields: drop.progress.verified ? [] : ["collected", "remaining", "contract", "marketplace"],
    sourceRefs: ["src/lib/creator-cloud/launch.ts", "src/contracts/drop-mode.v1.ts"],
    quantization: {
      threeLoadedBeforeIntent: false,
      web3LoadedBeforeIntent: false,
      agentToolingLoadedBeforeIntent: false,
    },
  };
}

export function applyRecipe(state: WorkspaceState, recipe: LaunchRecipeId): WorkspaceState {
  return { ...state, launch: instantiateLaunchRecipe(recipe) };
}

export function shiftPhaseHours(state: WorkspaceState, kind: string, hours: number): WorkspaceState {
  const launch = state.launch ?? instantiateLaunchRecipe("SIMPLE_DROP");
  return {
    ...state,
    launch: {
      ...launch,
      phases: launch.phases.map((phase) => {
        if (phase.kind !== kind && phase.label.toLowerCase() !== kind.toLowerCase()) return phase;
        if (!phase.startsAt) return phase;
        const start = new Date(phase.startsAt);
        if (Number.isNaN(start.getTime())) return phase;
        start.setHours(start.getHours() + hours);
        return { ...phase, startsAt: start.toISOString() };
      }),
    },
  };
}

export function remainingSpots(state: WorkspaceState, kind = "EARLY_ACCESS"): string {
  const launch = state.launch ?? instantiateLaunchRecipe("SIMPLE_DROP");
  const phase = launch.phases.find((p) => p.kind === kind);
  if (!phase) return "No early-access phase configured.";
  if (typeof phase.allocation !== "number") return "Early-access allocation is DRAFT / unset.";
  if (!state.dropVerified) return `${phase.allocation} allocation configured · remaining is UNVERIFIED until live source attaches.`;
  return `${phase.allocation} early-access spots configured.`;
}

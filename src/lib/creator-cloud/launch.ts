export type LaunchAudience =
  | "PUBLIC"
  | "COMMUNITY"
  | "INVITE_ONLY"
  | "HOLDERS"
  | "CUSTOM";

export type LaunchPhaseKind =
  | "FOUNDERS"
  | "EARLY_ACCESS"
  | "FREE_CLAIM"
  | "MEMBER"
  | "PUBLIC";

export type LaunchRecipeId =
  | "SIMPLE_DROP"
  | "COMMUNITY_DROP"
  | "GENESIS_DROP"
  | "HYPE_DROP"
  | "MEMBERSHIP_DROP"
  | "CUSTOM";

export interface LaunchPhase {
  id: string;
  label: string;
  kind: LaunchPhaseKind;
  audience: LaunchAudience;
  startsAt?: string;
  endsAt?: string;
  allocation?: number;
  maxPerCollector?: number;
  priceDisplay?: string;
  complimentary?: boolean;
}

export interface DropProgress {
  supply: number;
  created?: number;
  minted?: number;
  claimed?: number;
  remaining?: number;
  verified: boolean;
  source?: string;
}

export interface LaunchPlan {
  recipe: LaunchRecipeId;
  phases: LaunchPhase[];
}

export const LAUNCH_RECIPES: ReadonlyArray<{
  id: LaunchRecipeId;
  label: string;
  description: string;
  phases: Array<Pick<LaunchPhase, "label" | "kind" | "audience" | "complimentary">>;
}> = [
  {
    id: "SIMPLE_DROP",
    label: "Simple Drop",
    description: "Everyone gets access at launch.",
    phases: [{ label: "Public", kind: "PUBLIC", audience: "PUBLIC" }],
  },
  {
    id: "COMMUNITY_DROP",
    label: "Community Drop",
    description: "Give your community an early window before the public sale.",
    phases: [
      { label: "Community", kind: "EARLY_ACCESS", audience: "COMMUNITY" },
      { label: "Public", kind: "PUBLIC", audience: "PUBLIC" },
    ],
  },
  {
    id: "GENESIS_DROP",
    label: "Genesis Drop",
    description: "Founders first, then early access, then public.",
    phases: [
      { label: "Founders", kind: "FOUNDERS", audience: "INVITE_ONLY" },
      { label: "Early Access", kind: "EARLY_ACCESS", audience: "COMMUNITY" },
      { label: "Public", kind: "PUBLIC", audience: "PUBLIC" },
    ],
  },
  {
    id: "HYPE_DROP",
    label: "Hype Drop",
    description: "Optional complimentary claim before paid public access.",
    phases: [
      {
        label: "Free Claim",
        kind: "FREE_CLAIM",
        audience: "INVITE_ONLY",
        complimentary: true,
      },
      { label: "Early Access", kind: "EARLY_ACCESS", audience: "COMMUNITY" },
      { label: "Public", kind: "PUBLIC", audience: "PUBLIC" },
    ],
  },
  {
    id: "MEMBERSHIP_DROP",
    label: "Membership Drop",
    description: "Invite and member access before public availability.",
    phases: [
      { label: "Invite", kind: "EARLY_ACCESS", audience: "INVITE_ONLY" },
      { label: "Members", kind: "MEMBER", audience: "HOLDERS" },
      { label: "Public", kind: "PUBLIC", audience: "PUBLIC" },
    ],
  },
  {
    id: "CUSTOM",
    label: "Custom",
    description: "Build your own verified launch phases.",
    phases: [],
  },
];

export function instantiateLaunchRecipe(recipe: LaunchRecipeId): LaunchPlan {
  const template = LAUNCH_RECIPES.find((item) => item.id === recipe);
  if (!template) return { recipe: "CUSTOM", phases: [] };

  return {
    recipe,
    phases: template.phases.map((phase, index) => ({
      ...phase,
      id: `${recipe.toLowerCase()}-${index + 1}`,
    })),
  };
}

export function deriveRemaining(progress: DropProgress): number | undefined {
  if (!progress.verified) return undefined;
  if (typeof progress.remaining === "number") return Math.max(0, progress.remaining);

  const consumed =
    typeof progress.minted === "number"
      ? progress.minted
      : typeof progress.claimed === "number"
        ? progress.claimed
        : typeof progress.created === "number"
          ? progress.created
          : undefined;

  if (consumed === undefined) return undefined;
  return Math.max(0, progress.supply - consumed);
}

export function phaseStatus(
  phase: LaunchPhase,
  now = new Date(),
): "DRAFT" | "UPCOMING" | "LIVE" | "ENDED" {
  if (!phase.startsAt) return "DRAFT";

  const start = new Date(phase.startsAt);
  const end = phase.endsAt ? new Date(phase.endsAt) : undefined;

  if (Number.isNaN(start.getTime())) return "DRAFT";
  if (now < start) return "UPCOMING";
  if (end && !Number.isNaN(end.getTime()) && now > end) return "ENDED";
  return "LIVE";
}

export function assertNoFakeScarcity(progress: DropProgress): void {
  if (!progress.verified) {
    const hasLiveCounts =
      typeof progress.created === "number" ||
      typeof progress.minted === "number" ||
      typeof progress.claimed === "number" ||
      typeof progress.remaining === "number";

    if (hasLiveCounts) {
      throw new Error(
        "Unverified drop progress cannot be presented as live scarcity. Label it draft/simulation or attach a verified source.",
      );
    }
  }
}

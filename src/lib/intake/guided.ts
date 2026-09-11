import type { ProjectFactV1 } from "../../contracts/founder-intake.v1.ts";

export interface GuidedQuestion {
  key: string;
  prompt: string;
  help: string;
  choices: Array<{ id: string; label: string }>;
  ownership: ProjectFactV1["ownership"];
}

export function factValue(facts: ProjectFactV1[], key: string): string | undefined {
  const hit = facts.find((f) => f.key === key && f.status !== "MISSING" && f.status !== "CONFLICT");
  return hit?.value;
}

export function nextGuidedQuestion(facts: ProjectFactV1[]): GuidedQuestion | null {
  if (!factValue(facts, "projectType")) {
    return {
      key: "projectType",
      prompt: "What are we building?",
      help: "Pick the closest shape. You can change this later.",
      ownership: "REVIEW",
      choices: [
        { id: "LIMITED_DROP", label: "NFT / collectible drop" },
        { id: "TRADING_CARDS", label: "Trading cards" },
        { id: "GAME_ITEMS", label: "Game items" },
        { id: "MEMBERSHIP_PASS", label: "Membership" },
        { id: "DIGITAL_ART", label: "Digital art" },
        { id: "COMMUNITY_DROP", label: "Community drop" },
        { id: "UNDECIDED", label: "I'm not sure" },
        { id: "HELP", label: "Help me decide" },
      ],
    };
  }
  if (!factValue(facts, "artwork")) {
    return {
      key: "artwork",
      prompt: "Do you already have artwork?",
      help: "Holofoil can inventory what you have. You do not need a perfect folder first.",
      ownership: "AUTO",
      choices: [
        { id: "YES", label: "Yes — upload it" },
        { id: "SOME", label: "Some of it" },
        { id: "NOT_YET", label: "Not yet" },
        { id: "HELP", label: "Help me decide" },
      ],
    };
  }
  if (!factValue(facts, "supply")) {
    return {
      key: "supply",
      prompt: "How many should exist?",
      help: "This is a proposal until you confirm. Holofoil will not invent a live sold-out number.",
      ownership: "REVIEW",
      choices: [
        { id: "333", label: "333" },
        { id: "669", label: "669" },
        { id: "933", label: "933" },
        { id: "3333", label: "3,333" },
        { id: "UNDECIDED", label: "I'm not sure" },
        { id: "HELP", label: "Help me decide" },
      ],
    };
  }
  if (!factValue(facts, "ipOwner")) {
    return {
      key: "ipOwner",
      prompt: "Who owns the IP?",
      help: "Holofoil never takes client IP. This is a founder-only declaration.",
      ownership: "FOUNDER_ONLY",
      choices: [
        { id: "FOUNDER", label: "I own it" },
        { id: "STUDIO", label: "My studio owns it" },
        { id: "CLIENT", label: "A client owns it" },
        { id: "HELP", label: "Help me decide" },
      ],
    };
  }
  if (!factValue(facts, "destination")) {
    return {
      key: "destination",
      prompt: "How should people collect first?",
      help: "Web2 publishing stays first-class. A network is optional and approval-gated.",
      ownership: "REVIEW",
      choices: [
        { id: "WEB2_ONLY", label: "Hosted gallery / download" },
        { id: "HYBRID", label: "Web2 now, network later" },
        { id: "WEB3", label: "Prepare a network drop" },
        { id: "HELP", label: "Help me decide" },
      ],
    };
  }
  return null;
}

export function applyGuidedAnswer(facts: ProjectFactV1[], key: string, value: string): ProjectFactV1[] {
  if (value === "HELP") {
    return [
      ...facts.filter((f) => f.key !== `${key}Help`),
      {
        id: `help-${key}`,
        key: `${key}Help`,
        value: "NEURO will explain options. No silent default was chosen.",
        status: "PROPOSED",
        sourceRef: "guided",
        sourceKind: "GUIDED",
        confidence: 0.2,
        ownership: "REVIEW",
        updatedAt: "1970-01-01T00:00:00.000Z",
      },
    ];
  }
  const ownership = key === "ipOwner" ? "FOUNDER_ONLY" : key === "artwork" ? "AUTO" : "REVIEW";
  const status = key === "ipOwner" ? "VERIFIED" : "FOUND";
  return [
    ...facts.filter((f) => f.key !== key),
    {
      id: `guided-${key}`,
      key,
      value,
      status,
      sourceRef: "guided",
      sourceKind: "GUIDED",
      confidence: status === "VERIFIED" ? 1 : 0.7,
      ownership,
      updatedAt: "1970-01-01T00:00:00.000Z",
    },
  ];
}

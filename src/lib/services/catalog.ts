import type { HolofoilServiceId } from "@/contracts/service-enrollment.v1";

export type ServiceBuffetStep = {
  id: string;
  index: number;
  title: string;
  question: string;
  helper: string;
  services: Array<{
    id: HolofoilServiceId;
    label: string;
    description: string;
    optional?: boolean;
  }>;
  advanced: string[];
};

export const SERVICE_BUFFET: ServiceBuffetStep[] = [
  {
    id: "idea",
    index: 1,
    title: "Start",
    question: "What are you building?",
    helper: "Tell NEURO the idea. Holofoil turns it into a simple project plan.",
    services: [
      { id: "DROP_CREATION", label: "Build my drop", description: "Shape the idea, collection, artwork and launch path." },
    ],
    advanced: ["project contracts", "provenance", "agent routing", "governance state"],
  },
  {
    id: "make",
    index: 2,
    title: "Make",
    question: "What needs to be created?",
    helper: "Pick only what you need. The production machinery stays behind the curtain.",
    services: [
      { id: "COLLECTION_GENERATION", label: "Generate collection", description: "Layer mixing, rules, DNA, metadata and collection packaging." },
      { id: "TCG_GAME_SERVICES", label: "Add a game", description: "Optional reusable TCG and gameplay services for a project." , optional: true},
      { id: "LIVE_SESH_SOCIAL_GAMES", label: "Add live social play", description: "Optional Live Sesh and social-event game mechanics." , optional: true},
    ],
    advanced: ["deterministic generation", "capacity checks", "duplicate DNA", "agent job controls"],
  },
  {
    id: "rights",
    index: 3,
    title: "Rights",
    question: "How should people be allowed to use your IP?",
    helper: "Optional. Your project keeps its IP unless you explicitly configure rights.",
    services: [
      { id: "IP_EQUITY_ENGINE", label: "IP rights options", description: "Configure collector, commercial, earn-to-license, revenue-participation or custom rights." , optional: true},
    ],
    advanced: ["rights pools", "contribution receipts", "agreements", "machine-readable grants"],
  },
  {
    id: "launch",
    index: 4,
    title: "Launch",
    question: "How do you want people to collect?",
    helper: "Holofoil prepares the drop. Financial execution stays approval-gated.",
    services: [
      { id: "MINT_SERVICE", label: "Mint / publish", description: "Prepare, simulate, publish and return verified receipts when authorized." },
    ],
    advanced: ["chain adapters", "AQUADUCT testnet", "wallet routing", "transaction receipts"],
  },
];

export const PLAN_TIERS = [
  {
    id: "INDIVIDUAL",
    label: "Individual",
    seats: "1 founder profile",
    description: "For one creator or founder running a project with NEURO.",
    pricing: "DRAFT · operator sets price",
  },
  {
    id: "STUDIO",
    label: "Studio",
    seats: "1 founder + up to 4 team profiles",
    description: "For a small creative team sharing one project workspace.",
    pricing: "DRAFT · operator sets price",
  },
  {
    id: "TEAM",
    label: "Team",
    seats: "1 founder + up to 14 team profiles",
    description: "For teams that need role-based access across multiple workstreams.",
    pricing: "DRAFT · operator sets price",
  },
  {
    id: "ORGANIZATION",
    label: "Organization",
    seats: "Custom founder / admin / team structure",
    description: "For studios, brands and organizations with multiple projects and approval layers.",
    pricing: "CUSTOM",
  },
] as const;

export const KISS_MOTTO = "Keep It Simple. The complexity works for you, not against you.";

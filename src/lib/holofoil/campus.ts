import type { NavPath } from "./nav";

export interface CampusBuilding {
  id: string;
  name: string;
  hint: string;
  to: NavPath;
  accent: string;
  position: [number, number, number];
  size: [number, number, number];
  kind: "tower" | "lab" | "hall" | "vault";
}

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: "core",
    name: "Holofoil Core",
    hint: "Deterministic material system",
    to: "/",
    accent: "#3ee0ff",
    position: [0, 0, 0],
    size: [2.6, 5.2, 2.6],
    kind: "tower",
  },
  {
    id: "lab",
    name: "Material Lab",
    hint: "Configure foil · export JSON",
    to: "/lab",
    accent: "#3ee0ff",
    position: [-7.2, 0, -2.4],
    size: [2.8, 2.6, 2.6],
    kind: "lab",
  },
  {
    id: "studio",
    name: "Card Studio",
    hint: "Author trading-card presentation",
    to: "/studio",
    accent: "#c4454a",
    position: [-5.4, 0, 5.2],
    size: [3.0, 2.1, 2.8],
    kind: "hall",
  },
  {
    id: "dex",
    name: "Creature-Dex",
    hint: "Twelve original specimens",
    to: "/dex",
    accent: "#3ee0ff",
    position: [1.8, 0, 7.4],
    size: [2.6, 2.3, 2.6],
    kind: "vault",
  },
  {
    id: "stage",
    name: "3D Stage",
    hint: "Convention pavilions",
    to: "/stage",
    accent: "#b6f25c",
    position: [7.4, 0, 2.6],
    size: [3.2, 2.5, 2.8],
    kind: "hall",
  },
  {
    id: "story",
    name: "Storyboard",
    hint: "Deterministic reveal beats",
    to: "/storyboard",
    accent: "#c4454a",
    position: [6.2, 0, -5.6],
    size: [2.4, 1.8, 3.0],
    kind: "lab",
  },
  {
    id: "sdk",
    name: "SDK / Integration",
    hint: "Origin → Holofoil → ARCANA-54",
    to: "/sdk",
    accent: "#3ee0ff",
    position: [-1.6, 0, -7.6],
    size: [2.8, 1.9, 2.4],
    kind: "vault",
  },
];

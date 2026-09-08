import type { FoilType } from "./materials";

export interface MaterialPavilion {
  id: string;
  name: string;
  foilType: FoilType;
  summary: string;
  accent: string;
}

export const MATERIAL_PAVILIONS: MaterialPavilion[] = [
  {
    id: "hiphop",
    name: "Broadcast Foil",
    foilType: "neon-glitch",
    summary: "High-contrast diffraction for media and drop sequences.",
    accent: "#3ee0ff",
  },
  {
    id: "videogames",
    name: "Sprite Stage",
    foilType: "chromatic",
    summary: "Game-asset presentation with RGB split and pixel lock.",
    accent: "#b6f25c",
  },
  {
    id: "tcg-fantasy",
    name: "Relic Press",
    foilType: "holographic",
    summary: "Classic trading-card holofoil with pointer refraction.",
    accent: "#8b7cff",
  },
  {
    id: "anime-oasis",
    name: "Prism Oasis",
    foilType: "prism",
    summary: "Faceted spectral bands for character close-ups.",
    accent: "#8b7cff",
  },
  {
    id: "genx-lounge",
    name: "Brushed Archive",
    foilType: "brushed-foil",
    summary: "Anisotropic metal for catalog and lounge objects.",
    accent: "#c9d4dc",
  },
  {
    id: "serialized",
    name: "Serialized Vault",
    foilType: "serialized-collectible",
    summary: "Museum-safe serial marks. No chain writes.",
    accent: "#b6f25c",
  },
  {
    id: "vapor",
    name: "Museum Glass",
    foilType: "museum-glass",
    summary: "Low-intensity vitrine treatment for spatial rooms.",
    accent: "#e8eef2",
  },
  {
    id: "obsidian",
    name: "Obsidian Foil",
    foilType: "obsidian-foil",
    summary: "Dark substrate with cyan edge fresnel.",
    accent: "#3ee0ff",
  },
];

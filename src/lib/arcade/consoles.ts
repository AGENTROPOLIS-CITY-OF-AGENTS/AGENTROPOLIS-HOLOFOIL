export type ArcadeGame = "snake" | "stub";

export type ConsoleConfig = {
  id: string;
  name: string;
  year: string;
  desc: string;
  color: string;
  accent: string;
  screen: string;
  game: ArcadeGame;
};

export const CONSOLES: ConsoleConfig[] = [
  {
    id: "atari",
    name: "Atari 2600",
    year: "1977 — CX-2600",
    desc: "Wood-grain wonder. Cartridge era begins.",
    color: "#5a3a22",
    accent: "#caa45a",
    screen: "#1a1a1a",
    game: "stub",
  },
  {
    id: "apple2",
    name: "Apple II",
    year: "1977 — A2S1",
    desc: "Beige box that taught a generation to code.",
    color: "#d9cdb8",
    accent: "#3a8a3a",
    screen: "#0a2a0a",
    game: "stub",
  },
  {
    id: "intelli",
    name: "Intellivision",
    year: "1979 — Mattel",
    desc: "16-bit before its time. Disc controller.",
    color: "#3a2a1a",
    accent: "#caa45a",
    screen: "#1a1a2a",
    game: "stub",
  },
  {
    id: "coleco",
    name: "ColecoVision",
    year: "1982 — 2400",
    desc: "Arcade at home. Donkey Kong pack-in.",
    color: "#1a1a1a",
    accent: "#e8b020",
    screen: "#0a0a0a",
    game: "stub",
  },
  {
    id: "gameboy",
    name: "Nintendo Game Boy",
    year: "1989 — DMG-01",
    desc: "8-bit handheld. Click to play SNAKE.",
    color: "#d9d4cc",
    accent: "#8b2020",
    screen: "#8fa432",
    game: "snake",
  },
  {
    id: "genesis",
    name: "Sega Genesis",
    year: "1990 — MK-1601",
    desc: "Blast processing. 16-bit attitude.",
    color: "#0a0a0a",
    accent: "#e8202a",
    screen: "#1a1a2a",
    game: "stub",
  },
];

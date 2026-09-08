export type SpriteStyle =
  | "retro-classic"
  | "cyberpunk-16bit"
  | "gameboy-mono"
  | "fantasy-rpg";

export interface PixelSprite {
  name: string;
  creator: string;
  prompt: string;
  style: SpriteStyle;
  colors: string[];
  pixelSize: number;
  frames: { [animation: string]: string[][][] };
  stats: {
    hp: number;
    mp: number;
    atk: number;
    def: number;
    spd: number;
  };
}

export interface StoryboardPanel {
  panelNumber: number;
  title: string;
  description: string;
  visualStylePrompt: string;
  cameraAngle: string;
  lighting: string;
  directorNotes: string;
}

export interface StoryboardDeck {
  id: string;
  storyPrompt: string;
  stylePreset: string;
  cameraAnglePreset: string;
  lightingPreset: string;
  panels: StoryboardPanel[];
  createdAt: string;
}

export type ElementalType =
  | "fire"
  | "water"
  | "earth"
  | "air"
  | "crystal"
  | "shadow"
  | "electric"
  | "plant"
  | "mystic"
  | "metal"
  | "beast"
  | "cosmic";

export interface Creature {
  dexNumber: string;
  slug: string;
  name: string;
  type: ElementalType;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  stats: {
    pwr: number;
    spd: number;
    res: number;
    bond: number;
  };
  lore: string;
  accent: string;
  colors: string[];
  serialPrefix: string;
}

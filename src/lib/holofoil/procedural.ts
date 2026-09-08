import { SpriteStyle } from './types';

// Let's define the character grids. 
// A single frame is represented by a 16x16 grid of colors or hex strings.
// Empty string represents transparent pixels.

export interface BakedCharacter {
  name: string;
  sourceType: string;
  sourceName: string;
  prompt: string;
  style: SpriteStyle;
  colors: string[];
  pixelSize: number;
  stats: { hp: number; mp: number; atk: number; def: number; spd: number };
  animations: {
    [name: string]: string[][][]; // animation -> array of frames (each frame is a 16x16 2D array of colors)
  };
}

// Generate a random pixel sprite symmetrically!
export function generateProceduralSprite(prompt: string, style: SpriteStyle, pixelSize: number = 16): BakedCharacter {
  // Select color palette based on style
  let palette: string[] = [];
  switch (style) {
    case 'retro-classic':
      palette = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'];
      break;
    case 'cyberpunk-16bit':
      palette = ['#ff007f', '#00f0ff', '#12003c', '#ffea00', '#7a00ff', '#ffffff', '#222222', '#ff5500', '#00ff66'];
      break;
    case 'gameboy-mono':
      palette = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f', '#0a230a'];
      break;
    case 'fantasy-rpg':
    default:
      palette = ['#ffffff', '#1a1a1a', '#e6c229', '#d11149', '#00b159', '#00aedb', '#f37735', '#4f3b78', '#542e71', '#a79aff', '#212121'];
      break;
  }

  // Consistent random seed from prompt
  let seed = 0;
  for (let i = 0; i < prompt.length; i++) {
    seed += prompt.charCodeAt(i) * (i + 1);
  }

  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Primary colors
  const coreColor = palette[Math.floor(random() * palette.length)];
  let secondColor = palette[Math.floor(random() * palette.length)];
  while (secondColor === coreColor) {
    secondColor = palette[Math.floor(random() * palette.length)];
  }
  const accentColor = palette[Math.floor(random() * palette.length)];
  const outlineColor = style === 'gameboy-mono' ? '#0f380f' : '#111111';

  // Construct a base model grid
  const templates = [
    // Humanoid shape
    [
      '..XXXX..',
      '.XXXXXX.',
      '.XXOOXX.',
      '..XSSX..',
      '.AASSAAP',
      'AASSSSAA',
      '.ASSSSA.',
      '..SSSS..',
      '..S..S..',
      '.LL..LL.'
    ],
    // Wizard/Slime/Creature
    [
      '..HXXH..',
      '.XXXXXX.',
      'HXXOOXXH',
      '.XSSSSS.',
      'XXSSSSXX',
      'XSSASSAX',
      '.SASSSAS',
      '..SSSS..',
      '.LL..LL.'
    ],
    // Quadruped/Monster
    [
      '..XXXX..',
      '.XXOOXX.',
      'XXXXXXSS',
      'XSSSSSSS',
      'SSSSSSSS',
      'SASSSASA',
      'S.S..S.S',
      'L.L..L.L'
    ]
  ];

  const rawTemplate = templates[Math.floor(random() * templates.length)];
  const colorsMap: { [key: string]: string } = {
    'X': coreColor,
    'S': secondColor,
    'O': '#ffffff', // eyes
    'o': '#000000',
    'A': accentColor,
    'P': '#ffe119', // gold accessory
    'H': '#a4b0be', // helmet or horns
    'L': outlineColor,
    '.': '' // transparent
  };

  const createFrame = (animation: string, frameIndex: number): string[][] => {
    const size = pixelSize;
    const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
    const startY = 2;
    const midX = Math.floor(size / 2);

    for (let r = 0; r < rawTemplate.length; r++) {
      const templateRow = rawTemplate[r];
      let rowOffset = 0;
      if (animation === 'idle') {
        rowOffset = frameIndex % 2 === 0 ? 0 : 1;
      } else if (animation === 'walk') {
        rowOffset = frameIndex % 2 === 0 ? -1 : 0;
      } else if (animation === 'jump') {
        rowOffset = -2;
      } else if (animation === 'attack' && frameIndex === 1) {
        rowOffset = 0;
      }

      const gridY = startY + r + rowOffset;
      if (gridY < 0 || gridY >= size) continue;

      for (let c = 0; c < templateRow.length; c++) {
        const char = templateRow[c];
        let pixelColor = colorsMap[char] || '';

        if (char === 'O') {
          if (animation === 'idle' && frameIndex === 2) {
            pixelColor = secondColor; // eye closed
          } else {
            pixelColor = '#ffffff';
          }
        }
        if (char === 'o') {
          pixelColor = outlineColor;
        }

        if (char === 'A' && animation === 'attack') {
          const stretch = frameIndex === 1 || frameIndex === 2 ? 2 : 0;
          const gridX = midX - 4 - stretch + c;
          if (gridX >= 0 && gridX < size) {
            grid[gridY][gridX] = pixelColor;
          }
          continue;
        }

        const leftX = midX - 1 - c;
        const rightX = midX + c;

        if (char === 'L' && animation === 'walk') {
          if (frameIndex === 0) {
            if (leftX >= 0) grid[gridY][leftX] = pixelColor;
          } else if (frameIndex === 1) {
            if (rightX < size) grid[gridY][rightX] = pixelColor;
          } else if (frameIndex === 2) {
            if (leftX + 1 >= 0) grid[gridY][leftX + 1] = pixelColor;
          } else {
            if (rightX - 1 < size) grid[gridY][rightX - 1] = pixelColor;
          }
          continue;
        }

        if (leftX >= 0) grid[gridY][leftX] = pixelColor;
        if (rightX < size) grid[gridY][rightX] = pixelColor;
      }
    }

    const outlineGrid = borderWrap(grid, outlineColor, size);
    return outlineGrid;
  };

  const borderWrap = (src: string[][], borderCol: string, size: number): string[][] => {
    const dst = src.map(row => [...row]);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (src[r][c] !== '') continue;
        const hasNeighbor =
          (r > 0 && src[r - 1][c] !== '') ||
          (r < size - 1 && src[r + 1][c] !== '') ||
          (c > 0 && src[r][c - 1] !== '') ||
          (c < size - 1 && src[r][c + 1] !== '');

        if (hasNeighbor) {
          dst[r][c] = borderCol;
        }
      }
    }
    return dst;
  };

  const animations: { [key: string]: string[][][] } = {
    idle: [0, 1, 2, 3].map(i => createFrame('idle', i)),
    walk: [0, 1, 2, 3].map(i => createFrame('walk', i)),
    jump: [0, 1].map(i => createFrame('jump', i)),
    attack: [0, 1, 2, 3].map(i => createFrame('attack', i)),
    hurt: [0, 1].map(i => createFrame('hurt', i)),
    death: [0, 1, 2, 3].map(i => createFrame('death', i))
  };

  const hp = Math.floor(random() * 80) + 40;
  const mp = Math.floor(random() * 100) + 10;
  const atk = Math.floor(random() * 15) + 5;
  const def = Math.floor(random() * 12) + 4;
  const spd = Math.floor(random() * 20) + 5;

  return {
    name: prompt.split(' ')[0] ? prompt.split(' ')[0].toUpperCase() : 'HERO',
    sourceType: 'text',
    sourceName: 'Just description',
    prompt,
    style,
    colors: [coreColor, secondColor, accentColor, outlineColor],
    pixelSize,
    stats: { hp, mp, atk, def, spd },
    animations
  };
}

export const galleryCharacters: BakedCharacter[] = [
  {
    name: "CRAYON WIZARD",
    sourceType: "crayon",
    sourceName: "My kid's wizard",
    prompt: "An 8-year-old's colorful hand-drawn wizard carrying a glowing staff, 8-bit retro pixel style",
    style: "retro-classic",
    colors: ["#3c40c6", "#ff5e57", "#ffdd59", "#485460", "#ffffff"],
    pixelSize: 16,
    stats: { hp: 55, mp: 90, atk: 12, def: 6, spd: 8 },
    animations: {} as any
  },
  {
    name: "SHADOW NINJA",
    sourceType: "photo",
    sourceName: "Photo of a friend",
    prompt: "Cyberpunk neon ninja with high collar and dual shadow katanas, 16-bit cyber design",
    style: "cyberpunk-16bit",
    colors: ["#ff007f", "#00f0ff", "#12003c", "#444444", "#ffffff"],
    pixelSize: 16,
    stats: { hp: 75, mp: 40, atk: 18, def: 8, spd: 19 },
    animations: {} as any
  },
  {
    name: "GOLDEN KNIGHT",
    sourceType: "prompt",
    sourceName: "Just description",
    prompt: "A retro pixel game sprite of a golden plate armored warrior with royal blue plumes and broadsword",
    style: "fantasy-rpg",
    colors: ["#ffe119", "#4363d8", "#9a6324", "#212121", "#ffffff"],
    pixelSize: 16,
    stats: { hp: 110, mp: 20, atk: 15, def: 18, spd: 5 },
    animations: {} as any
  }
];

// Initialize preset animations
galleryCharacters[0].animations = {
  idle: [0, 1, 2, 3].map(i => generateProceduralSprite(galleryCharacters[0].prompt, 'retro-classic', 16).animations.idle[i]),
  walk: [0, 1, 2, 3].map(i => generateProceduralSprite(galleryCharacters[0].prompt, 'retro-classic', 16).animations.walk[i]),
  jump: [0, 1].map(i => generateProceduralSprite(galleryCharacters[0].prompt, 'retro-classic', 16).animations.jump[i]),
  attack: [0, 1, 2, 3].map(i => generateProceduralSprite(galleryCharacters[0].prompt, 'retro-classic', 16).animations.attack[i]),
  hurt: [0, 1].map(i => generateProceduralSprite(galleryCharacters[0].prompt, 'retro-classic', 16).animations.hurt[i]),
  death: [0, 1, 2, 3].map(i => generateProceduralSprite(galleryCharacters[0].prompt, 'retro-classic', 16).animations.death[i])
};

galleryCharacters[1].animations = {
  idle: [0, 1, 2, 3].map(i => generateProceduralSprite(galleryCharacters[1].prompt, 'cyberpunk-16bit', 16).animations.idle[i]),
  walk: [0, 1, 2, 3].map(i => generateProceduralSprite(galleryCharacters[1].prompt, 'cyberpunk-16bit', 16).animations.walk[i]),
  jump: [0, 1].map(i => generateProceduralSprite(galleryCharacters[1].prompt, 'cyberpunk-16bit', 16).animations.jump[i]),
  attack: [0, 1, 2, 3].map(i => generateProceduralSprite(galleryCharacters[1].prompt, 'cyberpunk-16bit', 16).animations.attack[i]),
  hurt: [0, 1].map(i => generateProceduralSprite(galleryCharacters[1].prompt, 'cyberpunk-16bit', 16).animations.hurt[i]),
  death: [0, 1, 2, 3].map(i => generateProceduralSprite(galleryCharacters[1].prompt, 'cyberpunk-16bit', 16).animations.death[i])
};

galleryCharacters[2].animations = {
  idle: [0, 1, 2, 3].map(i => generateProceduralSprite(galleryCharacters[2].prompt, 'fantasy-rpg', 16).animations.idle[i]),
  walk: [0, 1, 2, 3].map(i => generateProceduralSprite(galleryCharacters[2].prompt, 'fantasy-rpg', 16).animations.walk[i]),
  jump: [0, 1].map(i => generateProceduralSprite(galleryCharacters[2].prompt, 'fantasy-rpg', 16).animations.jump[i]),
  attack: [0, 1, 2, 3].map(i => generateProceduralSprite(galleryCharacters[2].prompt, 'fantasy-rpg', 16).animations.attack[i]),
  hurt: [0, 1].map(i => generateProceduralSprite(galleryCharacters[2].prompt, 'fantasy-rpg', 16).animations.hurt[i]),
  death: [0, 1, 2, 3].map(i => generateProceduralSprite(galleryCharacters[2].prompt, 'fantasy-rpg', 16).animations.death[i])
};

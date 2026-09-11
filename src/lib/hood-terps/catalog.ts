export const HT_PRESENTATIONS = ["male", "female"] as const;
export const HT_COLORWAYS = [
  "lime-citrus",
  "purple-candy",
  "orange-tropical",
  "forest-earth",
  "black-gas",
] as const;
export const HT_EYE_STYLES = [
  "classic",
  "glow",
  "sleepy",
  "x-eyes",
  "angry",
  "drip",
  "outline",
  "spiral",
] as const;
export const HT_EYE_COLORS = [
  "lime",
  "purple",
  "orange",
  "forest",
  "black",
  "cyan",
  "crimson",
  "gold",
  "ice",
  "smoke",
  "rose",
  "jade",
  "bone",
] as const;
export const HT_BOTTOMS = [
  "low-rise-barrel",
  "barrel",
  "classic-sweats",
  "terp-cloud-sweats",
  "couch-lock-sweats",
  "open-hem-sweats",
  "cargo-sweats",
  "cargo-pants",
  "parachute-pants",
  "stacked-pants",
  "baggy-jeans",
  "low-rise-baggy-jeans",
  "carpenter-pants",
  "track-pants",
  "basketball-shorts",
  "sweat-shorts",
] as const;
export const HT_FOOTWEAR = [
  "high-top-sneaker",
  "low-top-sneaker",
  "skate-shoe",
  "runner",
  "work-boot",
  "futuristic-sneaker",
  "slide",
  "chunky-sneaker",
] as const;
export const HT_HANDS = ["open", "v-clutch", "fist"] as const;
export const HT_HELD = ["none", "joint", "blunt"] as const;

export const HT_EYE_STATE_COUNT = HT_EYE_STYLES.length * HT_EYE_COLORS.length;
export const HT_ORDERED_EYE_PAIRS = HT_EYE_STATE_COUNT * HT_EYE_STATE_COUNT;

export type HoodTerpTraits = {
  presentation: (typeof HT_PRESENTATIONS)[number];
  colorway: (typeof HT_COLORWAYS)[number];
  hair: string;
  headwear: "none" | "hood-up" | "hood-down" | "cap";
  leftEyeStyle: (typeof HT_EYE_STYLES)[number];
  leftEyeColor: (typeof HT_EYE_COLORS)[number];
  rightEyeStyle: (typeof HT_EYE_STYLES)[number];
  rightEyeColor: (typeof HT_EYE_COLORS)[number];
  faceAttire: "none" | "mask" | "shades";
  top: string;
  bottom: (typeof HT_BOTTOMS)[number];
  footwear: (typeof HT_FOOTWEAR)[number];
  socks: "hidden" | "visible";
  hand: (typeof HT_HANDS)[number];
  heldItem: (typeof HT_HELD)[number];
  jewelry: "none" | "chain";
  weedDetail: "none" | "aura";
  aura: "none" | "haze";
};

export type PantsParams = {
  waistHeight: number;
  rise: number;
  hipWidth: number;
  thighWidth: number;
  kneeWidth: number;
  hemWidth: number;
  inseam: number;
  taper: number;
  stacking: number;
  pocketStructure: "none" | "side" | "cargo";
};

export type FootwearParams = {
  outsoleProfile: "flat" | "cup" | "lugged";
  upperSilhouette: string;
  collarHeight: number;
  laceStructure: "none" | "standard";
  panelStructure: "plain" | "paneled";
  material: "canvas" | "leather" | "knit" | "mesh";
  accentColor: string;
};

export function pantsParams(bottom: HoodTerpTraits["bottom"]): PantsParams {
  const stacked = /stacked|baggy|parachute/.test(bottom);
  const shorts = /short/.test(bottom);
  const cargo = /cargo|carpenter/.test(bottom);
  return {
    waistHeight: /low-rise/.test(bottom) ? 0.2 : 0.45,
    rise: /low-rise/.test(bottom) ? 0.25 : 0.5,
    hipWidth: stacked ? 0.8 : 0.6,
    thighWidth: stacked ? 0.75 : 0.55,
    kneeWidth: stacked ? 0.7 : 0.5,
    hemWidth: /open-hem|barrel/.test(bottom) ? 0.7 : 0.45,
    inseam: shorts ? 0.25 : 0.8,
    taper: /track|classic/.test(bottom) ? 0.6 : 0.2,
    stacking: stacked ? 0.7 : 0.1,
    pocketStructure: cargo ? "cargo" : "side",
  };
}

export function footwearParams(shoe: HoodTerpTraits["footwear"]): FootwearParams {
  return {
    outsoleProfile: /boot/.test(shoe) ? "lugged" : /chunky|futuristic/.test(shoe) ? "cup" : "flat",
    upperSilhouette: shoe,
    collarHeight: /high-top|boot/.test(shoe) ? 0.7 : /slide/.test(shoe) ? 0.1 : 0.35,
    laceStructure: /slide/.test(shoe) ? "none" : "standard",
    panelStructure: /skate|work|futuristic/.test(shoe) ? "paneled" : "plain",
    material: /runner|futuristic/.test(shoe) ? "knit" : /boot/.test(shoe) ? "leather" : "canvas",
    accentColor: "unbranded",
  };
}

export function normalizeTraitVector(t: HoodTerpTraits): string {
  return [
    t.presentation,
    t.colorway,
    t.hair,
    t.headwear,
    `${t.leftEyeStyle}:${t.leftEyeColor}`,
    `${t.rightEyeStyle}:${t.rightEyeColor}`,
    t.faceAttire,
    t.top,
    t.bottom,
    t.footwear,
    t.socks,
    t.hand,
    t.heldItem,
    t.jewelry,
    t.weedDetail,
    t.aura,
  ].join("|");
}

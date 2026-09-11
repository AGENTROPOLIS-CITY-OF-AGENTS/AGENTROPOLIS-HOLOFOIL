import { HOOD_TERPS_GENESIS_033 } from "../../contracts/hood-terps-genesis-033.v1.ts";
import {
  HT_BOTTOMS,
  HT_COLORWAYS,
  HT_EYE_COLORS,
  HT_EYE_STYLES,
  HT_FOOTWEAR,
  HT_PRESENTATIONS,
  type HoodTerpTraits,
} from "./catalog.ts";
import { isValidTraitVector, qcHeldItem } from "./constraints.ts";
import { assertUniqueDna, collectibleDna } from "./dna.ts";

export type GenesisItem = {
  index: number;
  traits: HoodTerpTraits;
  dna: string;
  qc: "PASS" | "ART_QC_BLOCKED";
};

const SEED = "genesis-033";

function base(partial: Partial<HoodTerpTraits>): HoodTerpTraits {
  return {
    presentation: "male",
    colorway: "lime-citrus",
    hair: "short",
    headwear: "none",
    leftEyeStyle: "classic",
    leftEyeColor: "lime",
    rightEyeStyle: "classic",
    rightEyeColor: "lime",
    faceAttire: "none",
    top: "hoodie",
    bottom: "classic-sweats",
    footwear: "low-top-sneaker",
    socks: "hidden",
    hand: "open",
    heldItem: "none",
    jewelry: "none",
    weedDetail: "none",
    aura: "none",
    ...partial,
  };
}

function requiredVectors(): HoodTerpTraits[] {
  const items: HoodTerpTraits[] = [];
  for (const presentation of HT_PRESENTATIONS) {
    items.push(base({ presentation, hair: presentation === "female" ? "long" : "short" }));
  }
  for (const colorway of HT_COLORWAYS) {
    items.push(base({ colorway, leftEyeColor: colorway.split("-")[0] as HoodTerpTraits["leftEyeColor"], rightEyeColor: colorway.split("-")[0] as HoodTerpTraits["leftEyeColor"] }));
  }
  for (const [i, style] of HT_EYE_STYLES.entries()) {
    items.push(
      base({
        leftEyeStyle: style,
        rightEyeStyle: i % 2 === 0 ? style : HT_EYE_STYLES[(i + 3) % HT_EYE_STYLES.length],
        leftEyeColor: HT_EYE_COLORS[i],
        rightEyeColor: HT_EYE_COLORS[(i + 4) % HT_EYE_COLORS.length],
      }),
    );
  }
  for (const bottom of HOOD_TERPS_GENESIS_033.coverage.bottomsRequired) {
    items.push(base({ bottom, socks: /short|open-hem/.test(bottom) ? "visible" : "hidden" }));
  }
  for (const footwear of HOOD_TERPS_GENESIS_033.coverage.footwearSilhouettesRequired) {
    items.push(base({ footwear }));
  }
  items.push(base({ hand: "v-clutch", heldItem: "joint" }));
  items.push(base({ hand: "v-clutch", heldItem: "blunt", presentation: "female", colorway: "purple-candy" }));
  return items;
}

function uniqueValid(list: HoodTerpTraits[]): HoodTerpTraits[] {
  const out: HoodTerpTraits[] = [];
  const seen = new Set<string>();
  for (const t of list) {
    if (!isValidTraitVector(t)) continue;
    const dna = collectibleDna(t, SEED);
    if (seen.has(dna)) continue;
    seen.add(dna);
    out.push(t);
  }
  return out;
}

function fillTo33(start: HoodTerpTraits[]): HoodTerpTraits[] {
  const out = uniqueValid(start);
  let i = 0;
  while (out.length < HOOD_TERPS_GENESIS_033.collectionSize) {
    const candidate = base({
      presentation: HT_PRESENTATIONS[i % 2],
      colorway: HT_COLORWAYS[i % HT_COLORWAYS.length],
      bottom: HT_BOTTOMS[i % HT_BOTTOMS.length],
      footwear: HT_FOOTWEAR[i % HT_FOOTWEAR.length],
      leftEyeStyle: HT_EYE_STYLES[i % HT_EYE_STYLES.length],
      rightEyeStyle: HT_EYE_STYLES[(i + 1) % HT_EYE_STYLES.length],
      leftEyeColor: HT_EYE_COLORS[i % HT_EYE_COLORS.length],
      rightEyeColor: HT_EYE_COLORS[(i + 2) % HT_EYE_COLORS.length],
      hair: i % 5 === 0 ? "short" : "crop",
      socks: /short/.test(HT_BOTTOMS[i % HT_BOTTOMS.length]) ? "visible" : "hidden",
    });
    i += 1;
    if (!isValidTraitVector(candidate)) continue;
    const dna = collectibleDna(candidate, SEED);
    if (out.some((t) => collectibleDna(t, SEED) === dna)) continue;
    out.push(candidate);
    if (i > 400) break;
  }
  return out.slice(0, HOOD_TERPS_GENESIS_033.collectionSize);
}

export function generateGenesis033(): GenesisItem[] {
  const traits = fillTo33(requiredVectors());
  const items = traits.map((t, index) => ({
    index: index + 1,
    traits: t,
    dna: collectibleDna(t, SEED),
    qc: (qcHeldItem(t).status === "PASS" ? "PASS" : "ART_QC_BLOCKED") as GenesisItem["qc"],
  }));
  assertUniqueDna(items.map((i) => i.dna));
  return items;
}

export function genesisCoverage(items: GenesisItem[]) {
  const presentations = new Set(items.map((i) => i.traits.presentation));
  const colorways = new Set(items.map((i) => i.traits.colorway));
  const eyeStyles = new Set(items.flatMap((i) => [i.traits.leftEyeStyle, i.traits.rightEyeStyle]));
  const mixed = items.some(
    (i) => i.traits.leftEyeStyle !== i.traits.rightEyeStyle || i.traits.leftEyeColor !== i.traits.rightEyeColor,
  );
  const bottoms = new Set(items.map((i) => i.traits.bottom));
  const footwear = new Set(items.map((i) => i.traits.footwear));
  return {
    presentations: HT_PRESENTATIONS.every((p) => presentations.has(p)),
    colorways: HT_COLORWAYS.every((c) => colorways.has(c)),
    eyeStyles: HT_EYE_STYLES.every((s) => eyeStyles.has(s)),
    mixedEyes: mixed,
    bottoms: HOOD_TERPS_GENESIS_033.coverage.bottomsRequired.every((b) => bottoms.has(b)),
    footwear: HOOD_TERPS_GENESIS_033.coverage.footwearSilhouettesRequired.every((f) => footwear.has(f)),
    ready: items.filter((i) => i.qc === "PASS").length,
    total: items.length,
  };
}

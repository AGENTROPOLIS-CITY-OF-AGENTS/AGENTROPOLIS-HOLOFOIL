import type { ProjectFactV1 } from "../../contracts/founder-intake.v1.ts";

function fact(
  key: string,
  value: string,
  status: ProjectFactV1["status"],
  ownership: ProjectFactV1["ownership"],
): ProjectFactV1 {
  return {
    id: `conv-${key}`,
    key,
    value,
    status,
    sourceRef: "conversation",
    sourceKind: "CONVERSATION",
    confidence: status === "PROPOSED" ? 0.4 : 0.55,
    ownership,
    updatedAt: "1970-01-01T00:00:00.000Z",
  };
}

export function parseFounderStatement(text: string): { facts: ProjectFactV1[]; summary: string } {
  const raw = text.trim();
  if (!raw) return { facts: [], summary: "Nothing to parse yet." };
  const lower = raw.toLowerCase();
  const facts: ProjectFactV1[] = [];

  const supply =
    raw.match(/(\d{2,5})\s*-\s*piece/i)?.[1] ||
    raw.match(/(\d{2,5})\s+(?:character |robot |art )?cards?/i)?.[1] ||
    raw.match(/\b(\d{2,5})\b/)?.[1];
  if (supply) facts.push(fact("supply", supply, "FOUND", "REVIEW"));

  if (/trading card|tcg|battle|clash/.test(lower)) {
    facts.push(fact("projectType", "TRADING_CARDS", "PROPOSED", "REVIEW"));
    facts.push(fact("game", "REQUIRED", "PROPOSED", "REVIEW"));
  } else if (/membership|pass/.test(lower)) {
    facts.push(fact("projectType", "MEMBERSHIP_PASS", "PROPOSED", "REVIEW"));
  } else if (/game item/.test(lower)) {
    facts.push(fact("projectType", "GAME_ITEMS", "PROPOSED", "REVIEW"));
  } else if (/nft|collectible|drop/.test(lower)) {
    facts.push(fact("projectType", "LIMITED_DROP", "PROPOSED", "REVIEW"));
  } else if (/digital art|art/.test(lower)) {
    facts.push(fact("projectType", "DIGITAL_ART", "PROPOSED", "REVIEW"));
  } else {
    facts.push(fact("projectType", "UNDECIDED", "MISSING", "FOUNDER_ONLY"));
  }

  if (/rare|rarity/.test(lower)) facts.push(fact("rarity", "REQUESTED", "FOUND", "REVIEW"));
  if (/discord|community/.test(lower)) facts.push(fact("community", "FOUND", "FOUND", "REVIEW"));
  if (/artwork|drawing|character/.test(lower) && /have|got|uploaded/.test(lower)) {
    facts.push(fact("artwork", "FOUND", "FOUND", "AUTO"));
  } else {
    facts.push(fact("artwork", "MISSING", "MISSING", "AUTO"));
  }
  if (/license|rights|equity|revenue/.test(lower)) {
    facts.push(fact("rightsIntent", "REQUESTED", "FOUND", "FOUNDER_ONLY"));
  }
  facts.push(fact("mint", "UNDECIDED", "MISSING", "FOUNDER_ONLY"));
  facts.push(fact("ipOwner", "UNDECIDED", "MISSING", "FOUNDER_ONLY"));

  const type = facts.find((f) => f.key === "projectType")?.value ?? "unknown";
  const size = facts.find((f) => f.key === "supply")?.value;
  const summary = size
    ? `I heard a ${type.replaceAll("_", " ").toLowerCase()} with ${size} pieces. Nothing is canonical until you confirm conflicts and founder-only decisions.`
    : `I captured a proposed project type (${type.replaceAll("_", " ").toLowerCase()}). I will only ask what is missing, conflicted, or founder-only.`;
  return { facts, summary };
}

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { detectConflicts, ingestFiles } from "./ingest.ts";
import type { ProjectFactV1 } from "../../contracts/founder-intake.v1.ts";
import { parseFounderStatement } from "./neuro.ts";
import { applyGuidedAnswer, nextGuidedQuestion } from "./guided.ts";
import { assemblePackage, nextFounderAction, readinessPercent, relevantServices } from "./package.ts";
import { hoodTerpsSeed } from "./hood-terps.fixture.ts";
import { assertEnrollmentHasNoExecutionAuthority } from "../../contracts/service-enrollment.v1.ts";

test("ingest membrane rejects executables and extracts supply from two sources as CONFLICT", () => {
  const { inventory, facts } = ingestFiles([
    { name: "../payload.exe", size: 12, type: "application/octet-stream" },
    { name: "pitch-deck.pptx", size: 2048 },
    { name: "traits.csv", size: 80, text: "supply,1000" },
    { name: "notes.json", size: 40, text: '{"supply":777,"name":"Neon Pack"}' },
    { name: "brand/logo.png", size: 900, type: "image/png" },
  ]);
  assert.equal(inventory.find((f) => f.filename.includes("exe"))?.assetClass, "REJECTED");
  assert.equal(facts.some((f) => f.key === "supply" && f.status === "CONFLICT"), true);
  assert.equal(facts.some((f) => f.key === "artwork" && f.status === "FOUND"), true);
  assert.equal(facts.some((f) => f.key === "name" && f.value === "Neon Pack"), true);
});

test("NEURO conversation proposes structure without inventing canonical traits", () => {
  const { facts, summary } = parseFounderStatement(
    "I have 300 character cards, a game idea, and a Discord community. I want to turn it into a collectible launch.",
  );
  assert.equal(facts.find((f) => f.key === "supply")?.value, "300");
  assert.equal(facts.find((f) => f.key === "projectType")?.status, "PROPOSED");
  assert.equal(facts.find((f) => f.key === "ipOwner")?.status, "MISSING");
  assert.match(summary, /not canonical|confirm/i);
});

test("guided path asks one question at a time", () => {
  let facts: ProjectFactV1[] = [];
  const first = nextGuidedQuestion(facts);
  assert.equal(first?.key, "projectType");
  facts = applyGuidedAnswer(facts, "projectType", "TRADING_CARDS");
  assert.equal(nextGuidedQuestion(facts)?.key, "artwork");
});

test("readiness is deterministic and explainable", () => {
  const pkg = assemblePackage("p", [
    { id: "1", key: "ipOwner", value: "FOUNDER", status: "VERIFIED", sourceRef: "g", sourceKind: "GUIDED", confidence: 1, ownership: "FOUNDER_ONLY", updatedAt: "t" },
  ]);
  const ready = readinessPercent(pkg);
  assert.equal(typeof ready.percent, "number");
  assert.match(ready.explain, /domains verified/);
});

test("conflict becomes the next founder action instead of a silent pick", () => {
  const facts = detectConflicts([
    { id: "a", key: "supply", value: "1000", status: "FOUND", sourceRef: "a.pdf", sourceKind: "UPLOAD", confidence: 0.6, ownership: "REVIEW", updatedAt: "t" },
    { id: "b", key: "supply", value: "777", status: "FOUND", sourceRef: "b.pptx", sourceKind: "UPLOAD", confidence: 0.6, ownership: "REVIEW", updatedAt: "t" },
  ]);
  const action = nextFounderAction(facts);
  assert.match(action.reason, /1000|777/);
  assert.match(action.label, /conflict/i);
});

test("HOOD TERPS seed does not transfer IP to Holofoil", () => {
  const seed = hoodTerpsSeed();
  assert.equal(seed.holofoilOwnsIp, false);
  assert.match(seed.ipOwnerLabel, /HOOD-TERPS/);
  assert.equal(seed.facts.find((f) => f.key === "mint")?.value, "OFF");
  assert.match(seed.facts.find((f) => f.key === "testnet")?.value ?? "", /46630/);
});

test("IP equity service stays hidden until rights intent exists", () => {
  assert.equal(relevantServices([]).includes("IP_EQUITY_ENGINE"), false);
  assert.equal(
    relevantServices([
      { id: "r", key: "rightsIntent", value: "REQUESTED", status: "FOUND", sourceRef: "c", sourceKind: "CONVERSATION", confidence: 0.5, ownership: "FOUNDER_ONLY", updatedAt: "t" },
    ]).includes("IP_EQUITY_ENGINE"),
    true,
  );
});

test("NEURO enrollment still cannot receive execution authority", () => {
  assert.equal(
    assertEnrollmentHasNoExecutionAuthority({
      version: "holofoil.service-enrollment.v1",
      enrollmentId: "e",
      workspaceId: "w",
      userId: "u",
      serviceIds: ["DROP_CREATION"],
      status: "DRAFT",
      createdAt: "t",
      concierge: {
        version: "holofoil.service-enrollment.v1",
        canonicalIdentity: "NEURO",
        mode: "HOLOFOIL_CONCIERGE",
        displayName: "NEURO",
        userId: "u",
        role: "AGENT_CONCIERGE",
        authority: "GUIDANCE_AND_ROUTING_ONLY",
        assignedAt: "t",
      },
    }),
    true,
  );
});

test("intake routes do not import Three.js", () => {
  const blob =
    readFileSync(new URL("../../routes/intake.tsx", import.meta.url), "utf8") +
    readFileSync(new URL("../../routes/project.tsx", import.meta.url), "utf8");
  assert.equal(blob.includes("three"), false);
  assert.equal(blob.includes("@react-three"), false);
});

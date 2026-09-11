import assert from "node:assert/strict";
import test from "node:test";
import { prefersReducedMotion } from "./motion.ts";

test("reduced-motion helper is false without matchMedia", () => {
  assert.equal(prefersReducedMotion(), false);
});

test("reduced-motion helper reads matchMedia when present", () => {
  const original = globalThis.window;
  (
    globalThis as { window?: { matchMedia: (q: string) => { matches: boolean } } }
  ).window = {
    matchMedia: (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
    }),
  };
  assert.equal(prefersReducedMotion(), true);
  if (original) {
    (globalThis as { window?: typeof original }).window = original;
  } else {
    delete (globalThis as { window?: unknown }).window;
  }
});

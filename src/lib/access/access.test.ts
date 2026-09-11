import assert from "node:assert/strict";
import test from "node:test";
import { ACCESS_DENIED_COPY } from "./copy.ts";
import { NAV_ITEMS } from "../holofoil/nav.ts";
import { can, accessClass, resolveAccess } from "./resolve.ts";

test("guest cannot access internal proof", () => {
  const guest = resolveAccess({ authenticated: false });
  assert.equal(accessClass(guest), "GUEST");
  assert.equal(can(guest, "internal.proofs.view"), false);
  assert.equal(can(guest, "holofoil.material.use"), false);
});

test("member cannot access internal proof without internal entitlement", () => {
  const member = resolveAccess({ authenticated: true, internal: false });
  assert.equal(accessClass(member), "MEMBER");
  assert.equal(can(member, "holofoil.material.use"), true);
  assert.equal(can(member, "internal.proofs.view"), false);
});

test("internal user can access proof", () => {
  const internal = resolveAccess({ authenticated: true, internal: true });
  assert.equal(accessClass(internal), "INTERNAL");
  assert.equal(can(internal, "internal.proofs.view"), true);
});

test("public nav does not contain Proof", () => {
  const labels = NAV_ITEMS.map((item) => `${item.to} ${item.label}`).join("\n");
  assert.equal(labels.toLowerCase().includes("proof"), false);
  assert.equal(labels.toLowerCase().includes("hood"), false);
});

test("direct /proof denial copy does not expose project data", () => {
  const blob = ACCESS_DENIED_COPY.toLowerCase();
  assert.equal(blob.includes("hood"), false);
  assert.equal(blob.includes("terp"), false);
  assert.equal(blob.includes("dna"), false);
  assert.equal(blob.includes("proof-001"), false);
});

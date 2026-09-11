import {
  INTERNAL_CAPABILITIES,
  MEMBER_CAPABILITIES,
  type AccessClass,
  type AccessContext,
  type Capability,
} from "./types.ts";

export function accessClass(ctx: AccessContext): AccessClass {
  if (ctx.internal && ctx.authenticated) return "INTERNAL";
  if (ctx.authenticated && ctx.membership === "MEMBER") return "MEMBER";
  return "GUEST";
}

export function can(ctx: AccessContext, capability: Capability): boolean {
  return ctx.capabilities.includes(capability);
}

/**
 * DATA SOURCE: FIXTURE for entitlements.
 * Authentication is resolved separately (Better Auth session or none).
 * Does not represent production membership, plans, or payments.
 */
export function resolveAccess(input: {
  authenticated: boolean;
  internal?: boolean;
  authSource?: AccessContext["authSource"];
}): AccessContext {
  if (!input.authenticated) {
    return {
      authenticated: false,
      membership: "NONE",
      internal: false,
      capabilities: [],
      authSource: input.authSource ?? "NONE",
      entitlementSource: "FIXTURE",
    };
  }
  if (input.internal) {
    return {
      authenticated: true,
      membership: "MEMBER",
      internal: true,
      capabilities: [...INTERNAL_CAPABILITIES],
      authSource: input.authSource ?? "SESSION",
      entitlementSource: "FIXTURE",
    };
  }
  return {
    authenticated: true,
    membership: "MEMBER",
    internal: false,
    capabilities: [...MEMBER_CAPABILITIES],
    authSource: input.authSource ?? "SESSION",
    entitlementSource: "FIXTURE",
  };
}

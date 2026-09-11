import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { resolveAccess } from "./resolve";
import type { AccessContext } from "./types";

/**
 * Session from Better Auth (or the disabled-auth dev fallback).
 * Entitlements from the labeled fixture adapter — not production billing.
 */
export function useAccess(): { isPending: boolean; access: AccessContext } {
  const { user, isPending } = useCurrentUserState();
  const internalFlag = import.meta.env.VITE_HOLOFOIL_INTERNAL === "true";
  const authenticated = user !== null;
  const authSource = !authenticated
    ? "NONE"
    : user.isDevFallback
      ? "DEV_FALLBACK"
      : "SESSION";
  return {
    isPending,
    access: resolveAccess({
      authenticated,
      internal: authenticated && internalFlag,
      authSource,
    }),
  };
}

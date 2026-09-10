import type { ReactNode } from "react";
import { useAccess } from "@/lib/access/use-access";
import { can } from "@/lib/access/resolve";
import type { Capability } from "@/lib/access/types";
import { AccessDenied } from "./AccessDenied";

export function CapabilityGate({
  capability,
  children,
}: {
  capability: Capability;
  children: ReactNode;
}) {
  const { isPending, access } = useAccess();
  if (isPending) {
    return <p className="px-4 py-16 text-sm text-muted">Checking access…</p>;
  }
  if (!can(access, capability)) return <AccessDenied />;
  return <>{children}</>;
}

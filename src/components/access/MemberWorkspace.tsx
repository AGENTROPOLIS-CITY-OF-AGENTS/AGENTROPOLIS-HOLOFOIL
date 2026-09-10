import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useAccess } from "@/lib/access/use-access";
import { can } from "@/lib/access/resolve";
import type { Capability } from "@/lib/access/types";

export function MemberWorkspace({
  capability,
  title,
  children,
}: {
  capability: Capability;
  title: string;
  children: ReactNode;
}) {
  const { isPending, access } = useAccess();
  if (isPending) {
    return <p className="px-4 py-16 text-sm text-muted">Checking access…</p>;
  }
  if (!can(access, capability)) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <p className="font-mono text-[11px] tracking-[0.22em] text-cyan uppercase">
          Member workspace
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-muted">
          This operational workspace requires an Agentropolis membership. Guests
          can preview capabilities on Campus and in the SDK.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/login"
            className="inline-flex min-h-12 items-center rounded-full bg-cyan px-5 text-sm font-medium text-bg no-underline"
          >
            Sign in
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-12 items-center rounded-full border border-border px-5 text-sm text-fg no-underline"
          >
            Join Agentropolis
          </Link>
        </div>
      </main>
    );
  }
  return <>{children}</>;
}

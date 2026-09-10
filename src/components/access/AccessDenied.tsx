import { Link } from "@tanstack/react-router";

import { ACCESS_DENIED_COPY } from "@/lib/access/copy";
export function AccessDenied() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
        Access denied
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight">Not available</h1>
      <p className="mt-3 text-sm text-muted">{ACCESS_DENIED_COPY}</p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-cyan px-5 text-sm font-medium text-bg no-underline"
      >
        Back to Holofoil
      </Link>
    </main>
  );
}

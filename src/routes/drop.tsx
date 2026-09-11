import { Link, createFileRoute } from "@tanstack/react-router";
import { DropCockpit } from "@/components/creator-cloud/DropCockpit";
import { initialWorkspace } from "@/lib/creator-cloud/workspace";

export const Route = createFileRoute("/drop")({ component: DropPage });

function DropPage() {
  const state = initialWorkspace();
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-lime">Creator Cloud</p>
      <h1 className="mt-2 font-display text-4xl">Drop Mode</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Public drop surface. Live numbers only appear from verified state. Test mint runs on Robinhood Chain Testnet and routes funding through AGENTROPOLIS AQUEDUCT.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to="/embed/mint"
          className="inline-flex min-h-11 items-center rounded-full border border-lime px-4 py-2 text-sm font-medium text-lime no-underline"
        >
          Open Test Mint
        </Link>
        <span className="inline-flex min-h-11 items-center rounded-full border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Robinhood Testnet · 46630
        </span>
      </div>
      <div className="mt-6">
        <DropCockpit state={state} />
      </div>
    </main>
  );
}

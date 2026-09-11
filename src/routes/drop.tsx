import { createFileRoute } from "@tanstack/react-router";
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
        Public drop surface. No 3D runtime. No wallet stack. Live numbers only appear from verified state.
      </p>
      <div className="mt-6">
        <DropCockpit state={state} />
      </div>
    </main>
  );
}

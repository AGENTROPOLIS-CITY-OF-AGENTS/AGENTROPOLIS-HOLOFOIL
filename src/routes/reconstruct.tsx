import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadProject } from "@/lib/intake/store";
import { classifyReference, reconstructionNeeded } from "@/lib/reconstruction/classify";

const GenesisPanel = lazy(() =>
  import("@/components/intake/GenesisPanel").then((m) => ({ default: m.GenesisPanel })),
);

export const Route = createFileRoute("/reconstruct")({ component: ReconstructPage });

function ReconstructPage() {
  const { user, isPending } = useCurrentUserState();
  const project = loadProject();
  const [intent, setIntent] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const refs = useMemo(() => project?.inventory.filter((f) => f.assetClass === "IMAGE") ?? [], [project]);
  if (isPending) return null;
  if (!user) return <RedirectToSignIn to="/login" />;

  const needs = project ? reconstructionNeeded(project.inventory) : refs.length > 0;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/project" className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">
        ← Workspace
      </Link>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-lime">Your art</p>
      <h1 className="mt-2 font-display text-4xl">References received.</h1>
      <p className="mt-2 text-sm text-muted">
        {needs || refs.length
          ? "Your source files need rebuilding."
          : "No flattened or compressed references inventoried yet. Upload art first, or load the HOOD TERPS beta workspace."}
      </p>
      <p className="mt-4 text-sm text-muted">
        NEURO: I can rebuild production-ready assets from these references. I’ll show you anything that needs your approval.
        Hidden pixels are reconstructed, not recovered.
      </p>
      <button
        type="button"
        className="mt-6 min-h-12 w-full rounded-full bg-lime px-6 text-bg sm:w-auto"
        onClick={() => setIntent(true)}
      >
        Rebuild my assets
      </button>
      {intent ? (
        <Suspense fallback={<p className="mt-4 text-sm text-muted">Loading reconstruction tools…</p>}>
          <GenesisPanel />
        </Suspense>
      ) : null}
      <ul className="mt-6 grid gap-1 text-sm text-muted">
        {refs.map((file) => (
          <li key={file.id}>
            {file.filename} · {classifyReference(file)}
          </li>
        ))}
      </ul>
      <details className="mt-6 text-sm" open={advanced} onToggle={(e) => setAdvanced(e.currentTarget.open)}>
        <summary className="cursor-pointer text-cyan">Advanced details</summary>
        <p className="mt-2 text-xs text-muted">
          SOURCE CLASSIFICATION → ASSESS → RESTORE → SEGMENT → ALPHA → LANDMARKS → ALIGN → OCCLUSION → 2.5D → PARAMETRIC
          REDRAW → LAYER SYNTHESIS → CONSTRAINTS → QC → HUMAN CANON APPROVAL → TESTNET-APPROVED ASSET. ATG Runtime compiles
          IR. Holofoil does not vendor provider syntax. Not classical photogrammetry unless multi-view exists.
        </p>
      </details>
    </main>
  );
}

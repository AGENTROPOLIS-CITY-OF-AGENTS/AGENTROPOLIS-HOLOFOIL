import { createFileRoute, Link } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { persistProject, emptyProject } from "@/lib/intake/store";
import { hoodTerpsSeed } from "@/lib/intake/hood-terps.fixture";

export const Route = createFileRoute("/intake")({ component: IntakePage });

function IntakePage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return null;
  if (!user) return <RedirectToSignIn to="/login" />;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan">New project</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Upload it. Tell NEURO. Or build it one step at a time.</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        You do not need a perfect folder. Holofoil inspects what you already have and only asks when something is missing,
        conflicted, or founder-only.
      </p>
      <div className="mt-8 grid gap-3">
        <Link to="/intake/upload" className="rounded-2xl border border-lime/40 bg-bg-elevated p-5 no-underline">
          <p className="font-display text-2xl text-fg">Upload your project</p>
          <p className="mt-2 text-sm text-muted">ZIP, PDF, PPTX, DOCX, CSV, JSON, images, video, audio, 3D, brand kits, decks, lore.</p>
        </Link>
        <Link to="/intake/tell" className="rounded-2xl border border-border bg-bg-elevated p-5 no-underline">
          <p className="font-display text-2xl text-fg">Tell NEURO about it</p>
          <p className="mt-2 text-sm text-muted">Describe the project in plain language. Uncertainty stays visible.</p>
        </Link>
        <Link to="/intake/guided" className="rounded-2xl border border-border bg-bg-elevated p-5 no-underline">
          <p className="font-display text-2xl text-fg">Build it step by step</p>
          <p className="mt-2 text-sm text-muted">One decision at a time. Not a form.</p>
        </Link>
      </div>
      <button
        type="button"
        className="mt-6 text-sm text-cyan"
        onClick={() => {
          persistProject(hoodTerpsSeed());
          window.location.href = "/project";
        }}
      >
        Load HOOD TERPS as a beta client workspace
      </button>
      <button
        type="button"
        className="ml-4 text-sm text-muted"
        onClick={() => persistProject(emptyProject("GUIDED"))}
      >
        Reset draft
      </button>
    </main>
  );
}

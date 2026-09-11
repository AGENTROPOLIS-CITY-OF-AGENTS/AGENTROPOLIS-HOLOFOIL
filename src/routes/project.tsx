import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ReadinessBoard } from "@/components/intake/ReadinessBoard";
import { loadProject } from "@/lib/intake/store";

export const Route = createFileRoute("/project")({ component: ProjectPage });

function ProjectPage() {
  const { user, isPending } = useCurrentUserState();
  const [details, setDetails] = useState(false);
  const project = useMemo(() => loadProject(), []);
  if (isPending) return null;
  if (!user) return <RedirectToSignIn to="/login" />;

  if (!project) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl">No project yet</h1>
        <Link to="/intake" className="mt-4 inline-block text-lime">
          Start intake
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ReadinessBoard project={project} />
      <button type="button" className="mt-6 text-sm text-cyan" onClick={() => setDetails((d) => !d)}>
        {details ? "Hide technical details" : "Show details"}
      </button>
      {details ? (
        <pre className="mt-4 overflow-auto rounded-2xl border border-border p-4 font-mono text-[11px] text-muted">
          {JSON.stringify(
            {
              facts: project.facts,
              inventory: project.inventory,
              launchPackage: project.launchPackage,
              events: project.events,
            },
            null,
            2,
          )}
        </pre>
      ) : null}
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { applyGuidedAnswer, nextGuidedQuestion } from "@/lib/intake/guided";
import { emptyProject, loadProject, mergeFacts, persistProject, recordEvent } from "@/lib/intake/store";

export const Route = createFileRoute("/intake/guided")({ component: GuidedIntake });

function GuidedIntake() {
  const { user, isPending } = useCurrentUserState();
  const [version, setVersion] = useState(0);
  const project = loadProject() ?? emptyProject("GUIDED");
  const question = nextGuidedQuestion(project.facts);
  if (isPending) return null;
  if (!user) return <RedirectToSignIn to="/login" />;

  function choose(id: string) {
    if (!question) return;
    if (id === "YES") {
      window.location.href = "/intake/upload";
    }
    const next = persistProject({ ...project, path: "GUIDED" });
    const merged = mergeFacts(next, applyGuidedAnswer(next.facts, question.key, id));
    recordEvent(merged, {
      label: `Decision recorded: ${question.key} = ${id}`,
      agentLabel: "NEURO",
      state: id === "HELP" ? "CAPTURED" : "VERIFIED",
    });
    setVersion(version + 1);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/intake" className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">
        ← Intake
      </Link>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-lime">NEURO</p>
      {question ? (
        <>
          <h1 className="mt-2 font-display text-3xl">{question.prompt}</h1>
          <p className="mt-2 text-sm text-muted">{question.help}</p>
          <div className="mt-6 grid gap-2">
            {question.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => choose(choice.id)}
                className="min-h-14 rounded-xl border border-border px-4 text-left hover:border-lime"
              >
                {choice.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h1 className="mt-2 font-display text-3xl">That is enough to start.</h1>
          <p className="mt-2 text-sm text-muted">The launch package is assembling behind the curtain.</p>
          <Link to="/project" className="mt-6 inline-block text-lime">
            Open workspace
          </Link>
        </>
      )}
    </main>
  );
}

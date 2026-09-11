import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { parseFounderStatement } from "@/lib/intake/neuro";
import { emptyProject, loadProject, mergeFacts, persistProject, recordEvent } from "@/lib/intake/store";

export const Route = createFileRoute("/intake/tell")({ component: TellNeuro });

function TellNeuro() {
  const { user, isPending } = useCurrentUserState();
  const [text, setText] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  if (isPending) return null;
  if (!user) return <RedirectToSignIn to="/login" />;

  function apply() {
    const parsed = parseFounderStatement(text);
    let project = loadProject() ?? emptyProject("TELL_NEURO");
    project = persistProject({ ...project, path: "TELL_NEURO" });
    project = mergeFacts(project, parsed.facts);
    recordEvent(project, {
      label: "Parsed founder statement into proposed project facts.",
      agentLabel: "NEURO",
      state: "CAPTURED",
    });
    setReply(parsed.summary);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/intake" className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">
        ← Intake
      </Link>
      <h1 className="mt-3 font-display text-3xl">Tell NEURO about it</h1>
      <p className="mt-2 text-sm text-muted">
        Example: “I have 300 character cards, a game idea, and a Discord community.”
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-5 min-h-40 w-full rounded-2xl border border-border bg-bg p-4 text-sm"
      />
      <button type="button" className="mt-4 min-h-11 rounded-full bg-lime px-5 text-bg" onClick={apply}>
        Convert into project understanding
      </button>
      {reply ? <p className="mt-4 text-sm text-muted">{reply}</p> : null}
      <Link to="/project" className="mt-6 inline-block text-sm text-lime">
        Open workspace
      </Link>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ingestFiles } from "@/lib/intake/ingest";
import { emptyProject, loadProject, mergeFacts, persistProject, recordEvent } from "@/lib/intake/store";

export const Route = createFileRoute("/intake/upload")({ component: UploadIntake });

function UploadIntake() {
  const { user, isPending } = useCurrentUserState();
  const [summary, setSummary] = useState<string | null>(null);
  if (isPending) return null;
  if (!user) return <RedirectToSignIn to="/login" />;

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    const files = await Promise.all(
      [...list].slice(0, 40).map(async (file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        text: /\.(csv|json|txt|md)$/i.test(file.name) ? await file.text() : undefined,
      })),
    );
    const { inventory, facts } = ingestFiles(files);
    let project = loadProject() ?? emptyProject("UPLOAD");
    project = persistProject({
      ...project,
      path: "UPLOAD",
      inventory: [...project.inventory, ...inventory],
    });
    project = mergeFacts(project, facts);
    recordEvent(project, {
      label: `Ingested ${inventory.length} files. ${inventory.filter((i) => i.assetClass === "REJECTED").length} rejected.`,
      agentLabel: "HOLOFOIL",
      state: "VERIFIED",
    });
    const found = inventory.filter((i) => i.status === "FOUND").map((i) => `${i.assetClass} · ${i.filename}`);
    const conflicts = facts.filter((f) => f.status === "CONFLICT" && f.sourceKind === "SYSTEM");
    setSummary(
      [
        `We found: ${found.join(" · ") || "no accepted files"}`,
        conflicts.length ? `CONFLICT: ${conflicts.map((c) => c.value).join(" · ")}` : "No supply/name conflicts.",
      ].join("\n"),
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/intake" className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">
        ← Intake
      </Link>
      <h1 className="mt-3 font-display text-3xl">Upload what you have</h1>
      <p className="mt-2 text-sm text-muted">Originals stay as inventory. Embedded instructions never grant execution authority.</p>
      <label className="mt-6 block rounded-2xl border border-dashed border-lime/40 p-8 text-center">
        <span className="text-sm text-fg">Drop files or browse</span>
        <input
          className="sr-only"
          type="file"
          multiple
          onChange={(e) => void onFiles(e.target.files)}
          accept=".zip,.pdf,.ppt,.pptx,.doc,.docx,.csv,.json,.png,.jpg,.jpeg,.webp,.gif,.svg,.mp4,.webm,.mp3,.wav,.glb,.gltf,.obj,.txt,.md"
        />
      </label>
      {summary ? <pre className="mt-6 whitespace-pre-wrap text-sm text-muted">{summary}</pre> : null}
      <Link to="/project" className="mt-6 inline-block text-sm text-lime">
        Open workspace
      </Link>
    </main>
  );
}

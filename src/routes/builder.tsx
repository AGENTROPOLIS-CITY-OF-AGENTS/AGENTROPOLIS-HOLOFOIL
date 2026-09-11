import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MixerWorkspace } from "@/components/creator-cloud/MixerWorkspace";
import { layerFromUpload } from "@/lib/creator-cloud/catalog";
import { applyAgentCommand } from "@/lib/creator-cloud/agent";
import {
  capacityReport,
  compileCsv,
  generateCollection,
  launchEstimate,
  parseTraitCsv,
} from "@/lib/creator-cloud/engine";
import { dnaFromLayers } from "@/lib/creator-cloud/dna";
import { initialWorkspace } from "@/lib/creator-cloud/workspace";
import {
  COLLECTION_TYPE_OPTIONS,
  STEPS,
  SUPPLY_PRESETS,
  type WorkspaceState,
} from "@/lib/creator-cloud/types";

export const Route = createFileRoute("/builder")({ component: BuilderPage });

type CollectionTypeId = (typeof COLLECTION_TYPE_OPTIONS)[number]["id"];

function BuilderPage() {
  const [state, setState] = useState<WorkspaceState>(initialWorkspace);
  const [agentText, setAgentText] = useState("");
  const [csvText, setCsvText] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [history, setHistory] = useState<WorkspaceState[]>([]);
  const progress = Math.round(((state.step + 1) / STEPS.length) * 100);

  const commit = (next: WorkspaceState) => {
    setHistory((h) => [...h.slice(-24), state]);
    setState(next);
  };

  const capacity = useMemo(
    () =>
      capacityReport(
        state.layers,
        state.rules,
        state.job.project.requestedSupply,
        state.uniqueRequired,
      ),
    [state.layers, state.rules, state.job.project.requestedSupply, state.uniqueRequired],
  );

  const estimate = launchEstimate(state.job.project.requestedSupply, state.destination);
  const generatedRun = useMemo(
    () =>
      generateCollection(
        state.layers,
        state.rules,
        state.seed,
        Math.min(state.job.project.requestedSupply, 81),
        state.uniqueRequired,
      ),
    [state.layers, state.rules, state.seed, state.job.project.requestedSupply, state.uniqueRequired],
  );

  const applyAgent = () => {
    const result = applyAgentCommand(state, agentText);
    commit({
      ...result.state,
      agentLog: [...state.agentLog, result.message],
    });
    setAgentText("");
  };

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const maxZ = Math.max(...state.layers.map((l) => l.z), 3);
    void Promise.all(
      [...files].slice(0, 24).map(
        (file, i) =>
          new Promise<WorkspaceState["layers"][number]>((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve(layerFromUpload(file, String(reader.result), maxZ + 1 + i));
            reader.readAsDataURL(file);
          }),
      ),
    ).then((uploaded) => commit({ ...state, layers: [...state.layers, ...uploaded] }));
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-lime">
            Holofoil Creator Cloud
          </p>
          <h1 className="mt-1 font-display text-4xl tracking-tight">Build My Drop</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Build your drop like a website. Publish it like a product.
          </p>
        </div>
        <div className="flex gap-2">
          {(["EASY", "PRO"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() =>
                commit({ ...state, job: { ...state.job, mode } })
              }
              className={`rounded-full px-4 py-2 text-xs font-medium ${
                state.job.mode === mode ? "bg-cyan text-bg" : "border border-border text-muted"
              }`}
            >
              {mode === "EASY" ? "Easy Mode" : "Pro Mode"}
            </button>
          ))}
        </div>
      </header>

      <ol className="mt-6 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => commit({ ...state, step: i })}
              className={i === state.step ? "text-cyan" : ""}
            >
              {i + 1}. {label}
            </button>
          </li>
        ))}
        <li className="ml-auto text-lime">{progress}%</li>
      </ol>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-2xl border border-border bg-bg-elevated p-5 sm:p-6">
          {state.step === 0 ? (
            <div>
              <h2 className="font-display text-2xl">What do you want people to collect?</h2>
              <p className="mt-2 text-sm text-muted">
                Start with the idea. We translate it into a collection job. We will not invent traits.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {COLLECTION_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      commit({
                        ...state,
                        job: {
                          ...state.job,
                          project: {
                            ...state.job.project,
                            collectionType: option.id as CollectionTypeId,
                            name:
                              option.id === "UNDECIDED"
                                ? state.job.project.name
                                : option.label,
                          },
                        },
                      })
                    }
                    className={`min-h-16 rounded-xl border p-4 text-left text-sm ${
                      state.job.project.collectionType === option.id
                        ? "border-lime bg-lime/10 text-fg"
                        : "border-border text-muted hover:text-fg"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <label className="mt-5 block text-sm text-muted">
                Describe it in your own words
                <textarea
                  value={state.ideaText}
                  onChange={(e) => commit({ ...state, ideaText: e.target.value })}
                  placeholder="I have 40 character drawings and want to make a 669-piece collection."
                  className="mt-2 min-h-28 w-full rounded-xl border border-border bg-bg p-3 text-sm text-fg"
                />
              </label>
              <button
                type="button"
                className="mt-3 rounded-full border border-lime px-4 py-2 text-sm text-lime"
                onClick={() => {
                  const result = applyAgentCommand(state, state.ideaText);
                  commit({ ...result.state, agentLog: [...state.agentLog, result.message] });
                }}
              >
                Translate into a collection job
              </button>
            </div>
          ) : null}

          {state.step === 1 ? (
            <div>
              <h2 className="font-display text-2xl">Add your artwork</h2>
              <p className="mt-2 text-sm text-muted">
                PNG layers, JPG, GIF, video, audio, 3D, folders, CSV. Filenames become layer names — traits are not invented.
              </p>
              <label className="mt-6 grid min-h-48 cursor-pointer place-items-center rounded-2xl border border-dashed border-cyan/40 bg-bg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.csv,.json,.glb,.gltf"
                  className="sr-only"
                  onChange={(e) => onFiles(e.target.files)}
                />
                <span>Drop files here or browse</span>
                <span className="mt-2 text-sm text-muted">
                  Starter SAMPLE layers are already loaded so you can mix immediately.
                </span>
              </label>
              <p className="mt-3 text-sm text-muted">
                {state.layers.filter((l) => l.source === "UPLOAD").length} uploads ·{" "}
                {state.layers.filter((l) => l.source === "SAMPLE").length} sample layers
              </p>
              <label className="mt-4 block text-sm text-muted">
                Optional trait CSV
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={"trait,value,lock\nAccent,Cyan visor,true"}
                  className="mt-2 min-h-24 w-full rounded-xl border border-border bg-bg p-3 font-mono text-xs"
                />
              </label>
              <button
                type="button"
                className="mt-2 rounded-full border border-border px-4 py-2 text-sm"
                onClick={() => commit({ ...state, rules: [...state.rules, ...parseTraitCsv(csvText)] })}
              >
                Import rules
              </button>
            </div>
          ) : null}

          {state.step === 2 ? (
            <MixerWorkspace
              state={state}
              onChange={commit}
              previews={generatedRun.items}
              onPickPreview={(item) =>
                commit({
                  ...state,
                  layers: state.layers.map((layer) => ({
                    ...layer,
                    visible: item.traits[layer.group] === layer.value,
                  })),
                })
              }
            />
          ) : null}

          {state.step === 3 ? (
            <div>
              <h2 className="font-display text-2xl">How many should we create?</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {SUPPLY_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() =>
                      commit({
                        ...state,
                        job: {
                          ...state.job,
                          project: { ...state.job.project, requestedSupply: n },
                        },
                      })
                    }
                    className={`min-h-11 rounded-full px-4 text-sm ${
                      state.job.project.requestedSupply === n
                        ? "bg-cyan text-bg"
                        : "border border-border"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <input
                aria-label="Collection size"
                type="number"
                min={1}
                value={state.job.project.requestedSupply}
                onChange={(e) =>
                  commit({
                    ...state,
                    job: {
                      ...state.job,
                      project: {
                        ...state.job.project,
                        requestedSupply: Math.max(1, Number(e.target.value) || 1),
                      },
                    },
                  })
                }
                className="mt-4 w-full max-w-xs rounded-xl border border-border bg-bg px-4 py-3 text-2xl"
              />
              <p className={`mt-4 text-sm ${capacity.safe ? "text-lime" : "text-crimson"}`}>
                {capacity.message}
              </p>
              <ul className="mt-4 grid gap-1 text-sm text-muted">
                <li>Artwork ready — {state.layers.length} layers</li>
                <li>
                  Unique items {generatedRun.validation.uniqueOk ? "validated" : "blocked"}
                </li>
                <li>No duplicate DNA in the unique set</li>
                <li>Collection information ready</li>
              </ul>
              <button
                type="button"
                className="mt-6 rounded-full bg-lime px-5 py-3 text-sm font-medium text-bg"
                onClick={() =>
                  commit({
                    ...state,
                    generated: generatedRun.items,
                    job: { ...state.job, action: "GENERATE" },
                  })
                }
              >
                Generate collection
              </button>
            </div>
          ) : null}

          {state.step === 4 ? (
            <div>
              <h2 className="font-display text-2xl">Set up your sale</h2>
              <label className="mt-4 block text-sm">
                How much should each collectible cost?
                <input
                  value={state.priceDisplay}
                  onChange={(e) => commit({ ...state, priceDisplay: e.target.value })}
                  placeholder="Free, $9, or name-your-price"
                  className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3"
                />
              </label>
              <label className="mt-4 block text-sm">
                Who gets early access?
                <textarea
                  value={state.earlyAccess}
                  onChange={(e) => commit({ ...state, earlyAccess: e.target.value })}
                  className="mt-2 min-h-24 w-full rounded-xl border border-border bg-bg p-3 text-sm"
                />
              </label>
              <label className="mt-4 block text-sm">
                Creator earnings on future sales
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={state.earningsPercent}
                  onChange={(e) =>
                    commit({ ...state, earningsPercent: Number(e.target.value) || 0 })
                  }
                  className="mt-2 w-28 rounded-xl border border-border bg-bg px-3 py-2"
                />
                %
              </label>
              <div className="mt-6 rounded-xl border border-border p-4 text-sm">
                <p className="font-medium">Estimated launch cost</p>
                <p className="mt-2 text-muted">Collection setup ${estimate.setup.toFixed(2)}</p>
                <p className="text-muted">Storage ${estimate.storage.toFixed(2)}</p>
                <p className="text-muted">Estimated network fees ${estimate.network.toFixed(2)}</p>
                <p className="mt-2 text-lime">Total ${estimate.total.toFixed(2)} USD</p>
                <p className="mt-2 text-xs text-muted">{estimate.note}</p>
                {state.job.mode === "PRO" ? (
                  <p className="mt-3 font-mono text-[11px] text-muted">
                    View advanced details: destination {state.destination} · no wallet loaded
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {state.step === 5 ? (
            <div>
              <h2 className="font-display text-2xl">Ready to publish</h2>
              <div className="mt-4 grid gap-2">
                {(["WEB2_ONLY", "WEB3"] as const).map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => commit({ ...state, destination: dest })}
                    className={`min-h-14 rounded-xl border px-4 text-left text-sm ${
                      state.destination === dest ? "border-lime text-fg" : "border-border text-muted"
                    }`}
                  >
                    {dest === "WEB2_ONLY"
                      ? "Download / hosted gallery (Web2)"
                      : "Publish to a supported network (optional, approval gated)"}
                  </button>
                ))}
              </div>
              <ul className="mt-4 grid gap-1 text-sm text-muted">
                <li>Artwork ready</li>
                <li>Unique items {capacity.safe ? "validated" : "not yet safe"}</li>
                <li>Collection information ready</li>
                <li>Files optimized (SVG/sample + uploads)</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full border border-border px-5 py-3 text-sm"
                  onClick={() => {
                    const blob = new Blob([compileCsv(generatedRun.items)], {
                      type: "text/csv",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "holofoil-collection.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export package
                </button>
                <button
                  type="button"
                  className="rounded-full bg-lime px-5 py-3 text-sm font-medium text-bg"
                  onClick={() => {
                    if (state.destination === "WEB3") {
                      setReceipt(
                        JSON.stringify(
                          {
                            status: "BLOCKED",
                            reason: "WEB3 execution requires an authority envelope and human approval.",
                            approvalRequired: true,
                            dna: dnaFromLayers(state.layers, state.seed),
                          },
                          null,
                          2,
                        ),
                      );
                      return;
                    }
                    setReceipt(
                      JSON.stringify(
                        {
                          version: "1.0.0",
                          jobId: state.job.jobId,
                          status: "SIMULATED",
                          destination: "WEB2_ONLY",
                          generatedCount: generatedRun.items.length,
                          duplicateCount: generatedRun.validation.duplicateCount,
                          dnaSample: generatedRun.items[0]?.dna ?? null,
                          approvalRequired: false,
                        },
                        null,
                        2,
                      ),
                    );
                  }}
                >
                  Publish Collection
                </button>
              </div>
              {receipt ? (
                <pre className="mt-4 overflow-auto rounded-xl border border-border bg-bg p-3 font-mono text-[11px] text-muted">
                  {receipt}
                </pre>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              disabled={state.step === 0}
              onClick={() => commit({ ...state, step: Math.max(0, state.step - 1) })}
              className="min-h-11 rounded-full border border-border px-5 text-sm disabled:opacity-30"
            >
              Back
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!history.length}
                onClick={() => {
                  const prev = history[history.length - 1];
                  if (!prev) return;
                  setHistory((h) => h.slice(0, -1));
                  setState(prev);
                }}
                className="min-h-11 rounded-full border border-border px-4 text-sm disabled:opacity-30"
              >
                Undo
              </button>
              <button
                type="button"
                disabled={state.step === STEPS.length - 1}
                onClick={() =>
                  commit({ ...state, step: Math.min(STEPS.length - 1, state.step + 1) })
                }
                className="min-h-11 rounded-full bg-cyan px-5 text-sm font-medium text-bg disabled:opacity-30"
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-lime/30 bg-bg-elevated p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime">
            Build With Agent
          </p>
          <h2 className="mt-2 font-display text-2xl">Tell Holofoil what you want.</h2>
          <p className="mt-2 text-sm text-muted">
            Same canonical job as the visual builder. Deterministic commands first. No publish bypass.
          </p>
          <textarea
            value={agentText}
            onChange={(e) => setAgentText(e.target.value)}
            placeholder="Make this a 669-piece collection. Lock cyan visor. Never combine Ghost with Holofoil H."
            className="mt-4 min-h-36 w-full rounded-xl border border-border bg-bg p-3 text-sm"
          />
          <button
            type="button"
            onClick={applyAgent}
            className="mt-3 w-full min-h-11 rounded-full border border-lime px-4 text-lime"
          >
            Apply Agent Instructions
          </button>
          <div className="mt-5 rounded-xl border border-border bg-bg p-3 text-sm">
            <p className="text-fg">{state.job.project.name}</p>
            <p className="mt-1 text-muted">
              {COLLECTION_TYPE_OPTIONS.find((o) => o.id === state.job.project.collectionType)?.label}
            </p>
            <p className="mt-1 text-muted">How many can exist? {state.job.project.requestedSupply}</p>
            <p className="mt-1 font-mono text-[11px] text-cyan">{state.job.jobId}</p>
          </div>
          {state.agentLog.length ? (
            <ul className="mt-4 grid gap-1 text-xs text-muted">
              {state.agentLog.slice(-6).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

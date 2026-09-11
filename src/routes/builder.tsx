import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/builder")({ component: Builder });

const COLLECTION_TYPES = [
  "Digital art collection",
  "Trading cards",
  "Avatar collection",
  "Game items",
  "Membership / access pass",
  "Limited-edition drop",
  "I'm not sure — help me build it",
];

const STEPS = ["Idea", "Artwork", "Mix", "Generate", "Price", "Publish"];

function Builder() {
  const [step, setStep] = useState(0);
  const [collectionType, setCollectionType] = useState(COLLECTION_TYPES[0]);
  const [supply, setSupply] = useState(333);
  const [agentPrompt, setAgentPrompt] = useState("");

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-3xl border border-border bg-bg-elevated p-6 sm:p-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-lime">Holofoil Creator Cloud</p>
              <h1 className="mt-2 font-display text-4xl text-fg">Build My Drop</h1>
              <p className="mt-3 max-w-2xl text-muted">Build your drop like a website. Holofoil handles the collection machinery underneath.</p>
            </div>
            <span className="rounded-full border border-cyan/40 px-3 py-1 font-mono text-xs text-cyan">Easy Mode</span>
          </div>

          <div className="mb-8">
            <div className="mb-2 flex justify-between text-xs text-muted"><span>{STEPS[step]}</span><span>{progress}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-bg-subtle"><div className="h-full bg-cyan transition-all" style={{ width: `${progress}%` }} /></div>
          </div>

          {step === 0 ? (
            <div>
              <h2 className="text-2xl font-semibold">What do you want people to collect?</h2>
              <p className="mt-2 text-muted">Start with the idea. We will translate it into the technical setup later.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {COLLECTION_TYPES.map((type) => (
                  <button key={type} type="button" onClick={() => setCollectionType(type)} className={`min-h-20 rounded-2xl border p-4 text-left transition ${collectionType === type ? "border-lime bg-lime/10 text-fg" : "border-border bg-bg-subtle text-muted hover:text-fg"}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="text-2xl font-semibold">Add your artwork</h2>
              <p className="mt-2 text-muted">Upload finished art, transparent layer folders, GIFs, video, audio, or 3D assets.</p>
              <div className="mt-6 rounded-3xl border border-dashed border-cyan/40 bg-bg-subtle p-12 text-center">
                <p className="text-lg">Drop files here</p>
                <p className="mt-2 text-sm text-muted">Holofoil can suggest layer groups without inventing your canonical traits.</p>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="text-2xl font-semibold">Mix your collection</h2>
              <p className="mt-2 text-muted">Visual layer composer with locks, exclusions, compatibility rules, randomization, live preview, and Holofoil materials.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-bg-subtle p-4"><p className="font-medium">Layers</p><p className="mt-2 text-sm text-muted">Reorder, toggle, lock, exclude.</p></div>
                <div className="min-h-64 rounded-2xl border border-cyan/30 bg-bg p-4"><p className="text-center text-sm text-muted">Live collectible preview</p></div>
                <div className="rounded-2xl border border-border bg-bg-subtle p-4"><p className="font-medium">Rules</p><p className="mt-2 text-sm text-muted">DNA uniqueness, compatibility, capacity.</p></div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h2 className="text-2xl font-semibold">How many should we create?</h2>
              <div className="mt-6 max-w-sm">
                <input aria-label="Collection supply" type="number" min={1} value={supply} onChange={(e) => setSupply(Math.max(1, Number(e.target.value)))} className="w-full rounded-2xl border border-border bg-bg px-4 py-4 text-3xl" />
                <div className="mt-4 grid gap-2 text-sm text-muted">
                  <span>✓ Make every item unique</span><span>✓ Avoid invalid combinations</span><span>✓ Check duplicate DNA</span><span>✓ Compile metadata automatically</span>
                </div>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h2 className="text-2xl font-semibold">Set up your sale</h2>
              <p className="mt-2 text-muted">Easy Mode uses product language. Blockchain details remain available in Pro Mode.</p>
              <div className="mt-6 grid gap-3"><label className="rounded-2xl border border-border bg-bg-subtle p-4">How much should each collectible cost?</label><label className="rounded-2xl border border-border bg-bg-subtle p-4">Who gets early access?</label><label className="rounded-2xl border border-border bg-bg-subtle p-4">Creator earnings on future sales</label><label className="rounded-2xl border border-border bg-bg-subtle p-4">Estimated launch cost</label></div>
            </div>
          ) : null}

          {step === 5 ? (
            <div>
              <h2 className="text-2xl font-semibold">Ready to publish</h2>
              <div className="mt-6 grid gap-2 text-sm text-muted"><span>✓ Artwork ready</span><span>✓ Unique outputs validated</span><span>✓ Collection information ready</span><span>✓ Files optimized</span><span>✓ Publishing destination selected</span></div>
              <button type="button" className="mt-8 rounded-full bg-lime px-6 py-3 font-semibold text-black">Publish Collection</button>
              <p className="mt-3 text-xs text-muted">Financial execution remains approval-gated. Simulation and preparation happen first.</p>
            </div>
          ) : null}

          <div className="mt-10 flex justify-between gap-3">
            <button type="button" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="rounded-full border border-border px-5 py-2 disabled:opacity-30">Back</button>
            <button type="button" disabled={step === STEPS.length - 1} onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} className="rounded-full bg-cyan px-5 py-2 font-medium text-black disabled:opacity-30">Continue</button>
          </div>
        </div>

        <aside className="rounded-3xl border border-lime/30 bg-bg-elevated p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">Build With Agent</p>
          <h2 className="mt-2 text-2xl font-semibold">Tell Holofoil what you want.</h2>
          <p className="mt-2 text-sm text-muted">The agent edits the same canonical collection job as the visual builder. No bypass around validation or approval.</p>
          <textarea value={agentPrompt} onChange={(e) => setAgentPrompt(e.target.value)} placeholder="Make this a 669-piece collection. Keep gold accessories limited. Never combine red hats with green jackets." className="mt-6 min-h-44 w-full rounded-2xl border border-border bg-bg p-4 text-sm" />
          <button type="button" className="mt-3 w-full rounded-full border border-lime px-5 py-3 text-lime">Apply Agent Instructions</button>
          <div className="mt-8 rounded-2xl border border-border bg-bg-subtle p-4 text-sm">
            <p className="font-medium text-fg">Current project</p>
            <p className="mt-2 text-muted">{collectionType}</p>
            <p className="mt-1 text-muted">Requested supply: {supply}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

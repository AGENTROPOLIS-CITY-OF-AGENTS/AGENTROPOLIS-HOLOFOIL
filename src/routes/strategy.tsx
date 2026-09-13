import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MemberWorkspace } from "@/components/access/MemberWorkspace";
import { applyDraftChange, proofFromReceipt, simulationToAtg } from "@/lib/strategy/engine";
import {
  NEURO_STRATEGY_PITCH,
  STRATEGY_INTENTS,
  neuroDelegateSimulation,
  worldFromProject,
} from "@/lib/strategy/neuro";
import { loadProject } from "@/lib/intake/store";
import type { StrategyObjective, StrategyWorldV1 } from "@/contracts/strategy-simulation.v1";

export const Route = createFileRoute("/strategy")({ component: StrategyRoute });

function StrategyRoute() {
  return (
    <MemberWorkspace capability="holofoil.strategy.simulate" title="Strategy Lab">
      <StrategyLabPage />
    </MemberWorkspace>
  );
}

function StrategyLabPage() {
  const project = loadProject();
  const [world, setWorld] = useState<StrategyWorldV1>(() => worldFromProject(project));
  const [objective, setObjective] = useState<StrategyObjective>("TEST_GAME");
  const [advanced, setAdvanced] = useState(false);
  const [seed, setSeed] = useState("holofoil-strategy-lab");
  const brief = useMemo(
    () => neuroDelegateSimulation({ project, world, objective, randomSeed: seed, numberOfRuns: 160 }),
    [project, world, objective, seed],
  );
  const proof = proofFromReceipt(brief.receipt);
  const atg = simulationToAtg(brief.receipt);

  return (
    <main className="mx-auto max-w-5xl px-3 py-6 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-lime">Optional add-on</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Strategy Lab</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Test your game, launch, community mechanics, incentives and scenarios before you commit.
      </p>

      <section className="mt-6 rounded-2xl border border-cyan/30 bg-bg-elevated p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime">NEURO · concierge</p>
        <p className="mt-2 text-sm text-fg">{NEURO_STRATEGY_PITCH}</p>
        <p className="mt-3 text-xs text-muted">
          NEURO delegates analysis to STRATEGY_SIMULATION_AGENT, then returns findings. The specialist is not a
          second concierge. Simulation has zero execution authority.
        </p>
      </section>

      <p className="mt-8 font-display text-2xl">Want to test your idea before launch?</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {STRATEGY_INTENTS.map((intent) => (
          <button
            key={intent.objective}
            type="button"
            onClick={() => setObjective(intent.objective)}
            className={`min-h-14 rounded-xl border px-3 text-sm ${
              objective === intent.objective ? "border-lime bg-lime/10 text-fg" : "border-border text-muted"
            }`}
          >
            {intent.label}
          </button>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-bg-elevated p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">Strategy check</p>
        <p className="mt-2 text-sm text-muted">{brief.summary}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {brief.receipt.resultsEpistemic} · {brief.receipt.kind} · seed {brief.receipt.randomSeed}
        </p>
        <ul className="mt-5 grid gap-2">
          {brief.receipt.findings.map((finding) => (
            <li key={finding.id} className="rounded-xl border border-border bg-bg p-3">
              <p className="text-sm text-fg">
                {finding.severity === "OK" ? "✓" : "⚠"} {finding.title}
              </p>
              <p className="mt-1 text-xs text-muted">{finding.detail}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan">{finding.epistemic}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-xl border border-lime/30 bg-lime/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-lime">Best next move</p>
          <p className="mt-2 text-sm">{brief.nextMove}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-12 rounded-full bg-lime px-4 text-sm font-medium text-bg"
              disabled={!brief.receipt.recommendations[0]}
              onClick={() => {
                const rec = brief.receipt.recommendations[0];
                if (!rec) return;
                setWorld(applyDraftChange(world, rec.draftChange));
                setSeed(`${seed}-draft`);
              }}
            >
              Apply Draft Change
            </button>
            <button
              type="button"
              className="min-h-12 rounded-full border border-border px-4 text-sm"
              onClick={() => setSeed(`rerun-${Date.now().toString(36)}`)}
            >
              Run Another Scenario
            </button>
            <button
              type="button"
              className="min-h-12 rounded-full border border-cyan px-4 text-sm text-cyan"
              onClick={() => setAdvanced((v) => !v)}
            >
              {advanced ? "Hide Advanced Analysis" : "View Advanced Analysis"}
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">
            Apply Draft Change only edits this simulation. Founder approval is required before any production rule
            change.
          </p>
        </div>
      </section>

      {advanced ? (
        <section className="mt-6 grid gap-4">
          <details className="rounded-2xl border border-border bg-bg p-4" open>
            <summary className="cursor-pointer text-sm text-cyan">Advanced methods</summary>
            <p className="mt-2 text-xs text-muted">
              game theory · mechanism design · Monte Carlo · agent-based modeling · adversarial simulation ·
              equilibrium analysis · sensitivity testing
            </p>
          </details>
          <pre className="overflow-auto rounded-2xl border border-border bg-bg p-4 font-mono text-[11px] text-muted">
            {JSON.stringify(
              {
                simulationId: brief.receipt.simulationId,
                specialist: brief.receipt.specialist,
                concierge: brief.receipt.concierge,
                authority: brief.receipt.authority,
                metrics: brief.receipt.metrics,
                assumptions: brief.receipt.assumptions,
                knownLimitations: brief.receipt.knownLimitations,
                atgConstraint: atg.constraints[0],
                proofFrames: proof.frames.map((frame) => frame.caption),
              },
              null,
              2,
            )}
          </pre>
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl border border-border bg-bg-elevated p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">Verified proof film</p>
        <h2 className="mt-1 font-display text-2xl">Only real simulation events</h2>
        <ol className="mt-4 grid gap-2">
          {proof.frames.map((frame) => (
            <li key={frame.order} className="rounded-xl border border-border bg-bg p-3 text-sm">
              <span className="font-mono text-[10px] text-muted">
                {frame.order} · {frame.agentLabel}
              </span>
              <p className="mt-1">{frame.caption}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

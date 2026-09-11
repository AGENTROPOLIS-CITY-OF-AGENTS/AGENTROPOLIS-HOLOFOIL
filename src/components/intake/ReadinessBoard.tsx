import type { FounderProjectV1 } from "@/lib/intake/store";
import { nextFounderAction, readinessPercent, relevantServices } from "@/lib/intake/package";
import { ROBINHOOD_TESTNET } from "@/contracts/founder-intake.v1";
import {
  HT_BOTTOMS,
  HT_COLORWAYS,
  HT_EYE_COLORS,
  HT_EYE_STYLES,
  HT_FOOTWEAR,
  HT_ORDERED_EYE_PAIRS,
} from "@/lib/hood-terps/catalog";

export function ReadinessBoard({ project }: { project: FounderProjectV1 }) {
  const ready = readinessPercent(project.launchPackage);
  const action = nextFounderAction(project.facts);
  const services = relevantServices(project.facts);
  const working = project.facts
    .filter((f) => f.status === "FOUND" || f.status === "PROPOSED")
    .slice(0, 3)
    .map((f) => f.key.replace(/([A-Z])/g, " $1"));
  const done = project.events.filter((e) => e.state === "VERIFIED").slice(-3);
  const frames = project.events.filter((e) => e.state === "VERIFIED" && e.screenshotRef);
  const traitOptions =
    HT_BOTTOMS.length + HT_FOOTWEAR.length + HT_EYE_STYLES.length + HT_EYE_COLORS.length + HT_COLORWAYS.length;

  return (
    <div className="grid gap-4">
      <section className="rounded-2xl border border-cyan/30 bg-bg-elevated p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan">{project.name}</p>
        <h1 className="mt-2 font-display text-4xl">Launch readiness {ready.percent}%</h1>
        <p className="mt-2 text-xs text-muted">{ready.explain}</p>
        <p className="mt-3 font-mono text-[11px] text-lime">IP owner · {project.ipOwnerLabel}</p>
        <p className="text-[11px] text-muted">Holofoil does not own client IP.</p>
      </section>

      <section className="rounded-2xl border border-lime/30 bg-bg-elevated p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime">NEURO · your agent concierge</p>
        <h2 className="mt-1 font-display text-2xl">Your agents are working on</h2>
        <ul className="mt-3 grid gap-1 text-sm text-muted">
          {(working.length ? working : ["Waiting on the next founder decision"]).map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <div className="mt-5 rounded-xl border border-border p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan">Needs you</p>
          <p className="mt-2 text-lg text-fg">{action.label}</p>
          <p className="mt-1 text-sm text-muted">{action.reason}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-bg-elevated p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Recently completed</p>
        <ul className="mt-3 grid gap-1 text-sm">
          {done.length ? done.map((e) => <li key={e.id}>✓ {e.label}</li>) : <li className="text-muted">No verified work yet.</li>}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-bg-elevated p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Art</p>
        <p className="mt-2 text-sm">
          {project.inventory.some((f) => f.assetClass === "IMAGE")
            ? "References found"
            : project.facts.find((f) => f.key === "artwork")?.value === "UNPRODUCED"
              ? "References missing · reconstruction optional"
              : "No art inventoried yet"}
        </p>
        <p className="mt-1 text-xs text-muted">Reconstruction 0 assets ready · 0 need approval until Rebuild runs.</p>
        <a href="/reconstruct" className="mt-3 inline-block text-sm text-lime">
          Rebuild my assets
        </a>
      </section>

      <section className="rounded-2xl border border-border bg-bg-elevated p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Traits</p>
        <p className="mt-2 text-sm">{traitOptions} canonical parametric options inventoried</p>
        <p className="mt-1 text-xs text-muted">
          {HT_ORDERED_EYE_PAIRS} theoretical ordered eye pairs. Design space, not published rarity.
        </p>
        <p className="mt-2 text-xs text-muted">Combinations · collection capacity checked only after generation.</p>
      </section>

      <section className="rounded-2xl border border-border bg-bg-elevated p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Relevant services</p>
        <p className="mt-2 text-sm text-muted">{services.join(" · ")}</p>
        <a href="/services" className="mt-3 inline-block text-sm text-cyan">
          Open service buffet
        </a>
      </section>

      <section className="rounded-2xl border border-border bg-bg-elevated p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Testnet</p>
        <p className="mt-2 text-sm">
          {ROBINHOOD_TESTNET.label} · chain {ROBINHOOD_TESTNET.chainId} · {ROBINHOOD_TESTNET.environment}
        </p>
        <p className="mt-2 text-xs text-muted">
          HOOD TERPS → Holofoil → AQUADUCT → Robinhood Chain Testnet → verified receipt. Not mainnet.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-bg-elevated p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">Proof-of-work recap</p>
        <p className="mt-2 text-sm text-muted">
          {frames.length >= 3
            ? `${frames.length} verified frames ready for a composite recap.`
            : "Video starts after verified screenshots exist. Nothing is staged."}
        </p>
      </section>
    </div>
  );
}

import { deriveDrop, dropReceipt, easyAccessLabel } from "@/lib/creator-cloud/drop";
import { instantiateLaunchRecipe, LAUNCH_RECIPES, phaseStatus } from "@/lib/creator-cloud/launch";
import type { WorkspaceState } from "@/lib/creator-cloud/types";

export function DropCockpit({
  state,
  onChange,
}: {
  state: WorkspaceState;
  onChange?: (next: WorkspaceState) => void;
}) {
  const drop = deriveDrop(state);
  const remaining = drop.progress.verified ? drop.progress.remaining : undefined;
  const collected = drop.progress.verified
    ? drop.progress.supply - (remaining ?? drop.progress.supply)
    : undefined;

  return (
    <section className="rounded-2xl border border-border bg-bg p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan">Holofoil Drop</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h2 className="font-display text-2xl">{drop.collectionName}</h2>
        <span className="rounded-full border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted">
          {drop.state}
        </span>
      </div>
      <p className="mt-3 font-display text-3xl text-fg">
        {drop.progress.verified ? (
          <>
            {collected} / {drop.progress.supply} collected
          </>
        ) : (
          <>
            {drop.progress.supply} can exist{" "}
            <span className="text-base text-muted">· collected count UNVERIFIED</span>
          </>
        )}
      </p>
      <ul className="mt-4 grid gap-2">
        {drop.launch.phases.map((phase) => {
          const status = phaseStatus(phase);
          return (
            <li key={phase.id} className="rounded-xl border border-border bg-bg-subtle p-3">
              <p className="text-sm text-fg">{phase.label}</p>
              <p className="text-xs text-muted">{easyAccessLabel(phase.audience)}</p>
              <p className="mt-1 font-mono text-[11px] text-cyan">
                {status === "DRAFT"
                  ? "Schedule not set · DRAFT"
                  : phase.startsAt
                    ? `Opens ${new Date(phase.startsAt).toLocaleString()}`
                    : status}
              </p>
              {phase.priceDisplay ? <p className="text-xs">{phase.priceDisplay}</p> : null}
              {typeof phase.allocation === "number" ? (
                <p className="text-xs text-muted">Allocation {phase.allocation} · {drop.progress.verified ? "verified" : "UNVERIFIED remaining"}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
      {onChange ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {LAUNCH_RECIPES.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => onChange({ ...state, launch: instantiateLaunchRecipe(recipe.id) })}
              className={`min-h-14 rounded-xl border px-3 text-left text-sm ${
                drop.launch.recipe === recipe.id ? "border-lime text-fg" : "border-border text-muted"
              }`}
            >
              {recipe.label}
              <span className="mt-1 block text-xs text-muted">{recipe.description}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {drop.primaryAction === "NOTIFY_ME" ? (
          <button type="button" className="min-h-11 rounded-full border border-cyan px-5 text-cyan">
            Notify me
          </button>
        ) : null}
        {drop.primaryAction === "COLLECT" ? (
          <button type="button" className="min-h-11 rounded-full bg-lime px-5 text-bg">
            Collect
          </button>
        ) : null}
        {drop.primaryAction === "VIEW_COLLECTION" ? (
          <button type="button" className="min-h-11 rounded-full border border-border px-5">
            View collection
          </button>
        ) : null}
        {drop.primaryAction === "NONE" ? (
          <p className="text-sm text-muted">No live collect action. Drop is {drop.state}.</p>
        ) : null}
      </div>
      {drop.marketplaceRoutes.length ? (
        <ul className="mt-3 text-sm">
          {drop.marketplaceRoutes.map((route) => (
            <li key={route.href}>
              <a href={route.href}>{route.label}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-muted">No verified marketplace routes.</p>
      )}
      <details className="mt-4 text-xs text-muted">
        <summary>Drop receipt</summary>
        <pre className="mt-2 overflow-auto">{JSON.stringify(dropReceipt(drop), null, 2)}</pre>
      </details>
    </section>
  );
}

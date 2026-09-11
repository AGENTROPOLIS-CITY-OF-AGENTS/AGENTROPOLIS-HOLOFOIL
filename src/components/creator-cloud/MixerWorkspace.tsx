import { lazy, Suspense, useMemo } from "react";
import { Lock, Unlock, ChevronUp, ChevronDown, Shuffle, Eye, EyeOff } from "lucide-react";
import { applyFoilPreset, DEFAULT_MATERIAL } from "@/lib/holofoil/materials";
import { capacityReport } from "@/lib/creator-cloud/engine";
import { dnaFromLayers } from "@/lib/creator-cloud/dna";
import { moveZ, selectOption, toggleLock, visibleStack } from "@/lib/creator-cloud/workspace";
import type { GeneratedItem, WorkspaceState } from "@/lib/creator-cloud/types";
import { PREVIEW_CAP } from "@/lib/creator-cloud/types";

const HolofoilCard = lazy(() =>
  import("@/components/holofoil/HolofoilCard").then((m) => ({ default: m.HolofoilCard })),
);

export function MixerWorkspace({
  state,
  onChange,
  previews,
  onPickPreview,
}: {
  state: WorkspaceState;
  onChange: (next: WorkspaceState) => void;
  previews: GeneratedItem[];
  onPickPreview: (item: GeneratedItem) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, WorkspaceState["layers"]>();
    for (const layer of [...state.layers].sort((a, b) => a.z - b.z)) {
      const list = map.get(layer.group) ?? [];
      list.push(layer);
      map.set(layer.group, list);
    }
    return [...map.entries()];
  }, [state.layers]);

  const capacity = capacityReport(
    state.layers,
    state.rules,
    state.job.project.requestedSupply,
    state.uniqueRequired,
  );
  const dna = dnaFromLayers(state.layers, state.seed);
  const stack = visibleStack(state);
  const material = applyFoilPreset(state.foilType, {
    ...DEFAULT_MATERIAL,
    seed: dna,
    pointerResponse: state.foilEnabled,
    mobileTilt: state.foilEnabled,
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_240px]">
      <aside className="rounded-2xl border border-border bg-bg-subtle p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">Layer tray</p>
        <ul className="mt-3 grid gap-3">
          {groups.map(([group, layers]) => (
            <li key={group}>
              <p className="text-xs text-muted">{group}</p>
              <div className="mt-1 grid gap-1">
                {layers.map((layer) => {
                  const active = layer.visible;
                  return (
                    <div
                      key={layer.id}
                      className={`flex min-h-11 min-w-0 items-center gap-1 rounded-lg border px-2 ${
                        active ? "border-cyan/40 bg-bg" : "border-border"
                      }`}
                    >
                      <button
                        type="button"
                        className="min-h-11 min-w-0 flex-1 truncate text-left text-sm"
                        onClick={() => onChange(selectOption(state, layer.group, layer.id))}
                      >
                        {layer.value}
                      </button>
                      <button
                        type="button"
                        className="grid size-9 place-items-center"
                        aria-label={layer.visible ? "Hide" : "Show"}
                        onClick={() =>
                          onChange({
                            ...state,
                            layers: state.layers.map((item) =>
                              item.id === layer.id ? { ...item, visible: !item.visible } : item,
                            ),
                          })
                        }
                      >
                        {layer.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5 text-muted" />}
                      </button>
                      <button
                        type="button"
                        className="grid size-9 place-items-center"
                        aria-label={layer.locked ? "Unlock" : "Lock"}
                        onClick={() => onChange(toggleLock(state, layer.id))}
                      >
                        {layer.locked ? (
                          <Lock className="size-3.5 text-lime" />
                        ) : (
                          <Unlock className="size-3.5 text-muted" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="grid size-8 place-items-center"
                        aria-label="Layer up"
                        onClick={() => onChange(moveZ(state, layer.id, 1))}
                      >
                        <ChevronUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="grid size-8 place-items-center"
                        aria-label="Layer down"
                        onClick={() => onChange(moveZ(state, layer.id, -1))}
                      >
                        <ChevronDown className="size-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <section className="rounded-2xl border border-border bg-bg p-4">
        <div className="mx-auto max-w-sm">
          <Suspense
            fallback={
              <div className="aspect-[63/88] rounded-[18px] border border-border bg-bg-elevated" />
            }
          >
            <HolofoilCard
              material={material}
              title={state.job.project.name}
              subtitle={stack.map((l) => l.value).join(" · ") || "Empty stack"}
              serial={dna.slice(0, 14).toUpperCase()}
              interactive={state.foilEnabled}
            >
              <div className="relative h-full w-full bg-bg">
                {stack.map((layer) => (
                  <img
                    key={layer.id}
                    src={layer.src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ))}
              </div>
            </HolofoilCard>
          </Suspense>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm"
            onClick={() =>
              onChange({
                ...state,
                seed: `seed-${Math.random().toString(36).slice(2, 8)}`,
                job: { ...state.job, composition: { ...state.job.composition, randomize: true } },
              })
            }
          >
            <Shuffle className="size-4" />
            Randomize
          </button>
        </div>
      </section>

      <aside className="rounded-2xl border border-border bg-bg-subtle p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime">Collection rules</p>
        <p className={`mt-3 text-sm ${capacity.safe ? "text-lime" : "text-crimson"}`}>{capacity.message}</p>
        <p className="mt-3 font-mono text-[11px] text-muted">DNA {dna}</p>
        <p className="mt-1 font-mono text-[11px] text-muted">Seed {state.seed}</p>
        <label className="mt-4 flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.uniqueRequired}
            onChange={(e) => onChange({ ...state, uniqueRequired: e.target.checked })}
          />
          Make every item unique
        </label>
        <label className="mt-2 flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.foilEnabled}
            onChange={(e) => onChange({ ...state, foilEnabled: e.target.checked })}
          />
          Apply Holofoil material
        </label>
        {state.rules.length ? (
          <ul className="mt-4 grid gap-1 text-xs text-muted">
            {state.rules.map((rule, i) => (
              <li key={i}>
                {rule.trait}
                {rule.value ? `=${rule.value}` : ""} {rule.lock ? "locked" : ""}{" "}
                {rule.excludeWith?.map((p) => `≠ ${p.trait}:${p.value}`).join(" ")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-xs text-muted">No exclusions yet. Ask the agent or add a CSV rule.</p>
        )}
      </aside>

      <div className="xl:col-span-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Preview strip</p>
        <ul className="mt-2 flex gap-2 overflow-x-auto pb-2">
          {previews.slice(0, PREVIEW_CAP).map((item) => (
            <li key={item.dna}>
              <button
                type="button"
                onClick={() => onPickPreview(item)}
                className="min-h-20 w-24 rounded-xl border border-border bg-bg-subtle p-2 text-left"
              >
                <p className="font-mono text-[10px] text-cyan">#{item.index}</p>
                <p className="truncate text-[11px] text-muted">{item.dna.slice(3, 11)}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

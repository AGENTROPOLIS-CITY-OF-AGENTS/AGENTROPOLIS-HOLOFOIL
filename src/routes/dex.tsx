import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CreatureGlyph } from "@/components/holofoil/CreatureGlyph";
import { HolofoilCard } from "@/components/holofoil/HolofoilCard";
import { CREATURES, foilForCreature } from "@/lib/holofoil/creatures";
import {
  applyFoilPreset,
  DEFAULT_MATERIAL,
  FOIL_TYPES,
} from "@/lib/holofoil/materials";
import { HolofoilService } from "@/lib/holofoil/service";
import type { Creature } from "@/lib/holofoil/types";

export const Route = createFileRoute("/dex")({ component: CreatureDexPage });

function CreatureDexPage() {
  const [active, setActive] = useState(CREATURES[0]);
  const [query, setQuery] = useState("");
  const [nodes, setNodes] = useState(0);

  const material = useMemo(
    () =>
      applyFoilPreset(foilForCreature(active), {
        ...DEFAULT_MATERIAL,
        glowColor:
          active.accent.startsWith("#") && active.accent.length === 7
            ? active.accent
            : DEFAULT_MATERIAL.glowColor,
        seed: `${active.serialPrefix}-${active.dexNumber}`,
      }),
    [active],
  );

  useEffect(() => {
    let cancelled = false;
    void HolofoilService.fetchHallNodes("3d-specimen-dex")
      .then((res) => {
        if (!cancelled && res.success) setNodes(res.count);
      })
      .catch(() => {
        if (!cancelled) setNodes(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = CREATURES.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.type.includes(q) ||
      c.dexNumber.includes(q)
    );
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">
            Creature-Dex Hall
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">
            Twelve original specimens.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Original catalog from the Holofoil hall. Each specimen is a foil
            presentation record — not a marketplace and not a chain inscription.
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">
          Hall nodes {nodes}
        </p>
      </header>

      <label className="mb-6 block max-w-md text-sm">
        <span className="sr-only">Search specimens</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, type, or number"
          className="h-11 w-full rounded-md border border-border bg-bg-elevated px-3"
        />
      </label>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <HolofoilCard
          material={material}
          title={active.name}
          subtitle={`${active.type} · ${active.rarity}`}
          serial={`${active.serialPrefix}-${active.dexNumber}`}
        >
          <CreatureGlyph creature={active} />
        </HolofoilCard>
        <div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(active.stats).map(([key, value]) => (
              <div
                key={key}
                className="rounded-[14px] border border-border bg-bg-elevated p-3"
              >
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {key}
                </dt>
                <dd className="font-display text-2xl">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm leading-relaxed text-muted">{active.lore}</p>
          <p className="mt-3 font-mono text-[11px] text-cyan">
            Material {foilForCreature(active)} · {FOIL_TYPES.length} lab types
            available
          </p>
        </div>
      </div>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((creature: Creature) => {
          const selected = creature.slug === active.slug;
          return (
            <li key={creature.slug}>
              <button
                type="button"
                onClick={() => setActive(creature)}
                className={`w-full rounded-[18px] border p-4 text-left ${
                  selected
                    ? "border-cyan bg-bg-subtle"
                    : "border-border bg-bg-elevated hover:border-border-strong"
                }`}
              >
                <p className="font-mono text-[10px] text-muted">
                  #{creature.dexNumber} · {creature.type}
                </p>
                <p className="mt-1 font-display text-lg">{creature.name}</p>
                <p className="mt-1 text-xs capitalize text-muted">
                  {creature.rarity}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

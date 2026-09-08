import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { HolofoilCard } from "@/components/holofoil/HolofoilCard";
import { DEFAULT_MATERIAL, FOIL_PRESETS, validateMaterialConfig } from "@/lib/holofoil/materials";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const featured = validateMaterialConfig({
    ...DEFAULT_MATERIAL,
    ...FOIL_PRESETS.holographic,
    seed: "landing-hero",
  }).value;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="font-mono text-[11px] tracking-[0.28em] text-cyan uppercase">
            HOLOFOIL
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl leading-[1.05] tracking-tight text-fg sm:text-5xl">
            Deterministic materials for digital collectibles.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Design, inspect and export responsive holographic surfaces for
            cards, artifacts, game assets and spatial experiences.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/lab"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan px-5 text-sm font-medium text-bg no-underline"
            >
              Open Material Lab
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/studio"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-5 text-sm text-fg no-underline"
            >
              Explore Card Studio
            </Link>
            <Link
              to="/sdk"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-5 text-sm text-muted no-underline"
            >
              View Integration Contract
            </Link>
          </div>
        </div>
        <HolofoilCard
          material={featured}
          title="Specimen Zero"
          subtitle="Pointer-responsive holographic foil"
          serial="HFO-0001"
        />
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          {
            kicker: "Origin Engine",
            title: "Inputs from Origin Engine",
            body: "Approved assets, metadata, QC results and collectible inputs arrive as typed records. Holofoil never authors the source art.",
          },
          {
            kicker: "Holofoil",
            title: "Materials rendered by Holofoil",
            body: "Deterministic foil configuration, pointer refraction, mobile tilt and exportable JSON another Agentropolis app can consume.",
          },
          {
            kicker: "ARCANA-54",
            title: "Spatial presentation in ARCANA-54",
            body: "Optional placement into relic rooms, museums and arcades. Security stays with AGENTROPOLIS-54T.",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-[22px] border border-border bg-bg-elevated p-5"
          >
            <p className="font-mono text-[10px] tracking-[0.2em] text-cyan uppercase">
              {card.kicker}
            </p>
            <h2 className="mt-3 font-display text-xl">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{card.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

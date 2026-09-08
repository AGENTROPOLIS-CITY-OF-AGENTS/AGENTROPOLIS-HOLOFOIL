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
    <main>
      <section className="border-b border-border bg-bg">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <img
            src="/holofoil-mark.jpg"
            alt="AGENTROPOLIS HOLOFOIL"
            width={1200}
            height={704}
            className="mx-auto w-full max-w-3xl"
          />
          <p className="mx-auto mt-8 max-w-2xl text-center text-base leading-relaxed text-muted sm:text-lg">
            Deterministic holographic and foil presentation for digital
            collectibles. Design, inspect, and export surfaces Origin Engine
            can send and ARCANA-54 can place.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <HolofoilCard
            material={featured}
            title="Specimen Zero"
            subtitle="Pointer-responsive holographic foil"
            serial="HFO-0001"
          >
            <div className="flex h-full items-center justify-center bg-bg">
              <img
                src="/holofoil-h.jpg"
                alt=""
                width={256}
                height={256}
                className="h-40 w-40 object-contain sm:h-48 sm:w-48"
              />
            </div>
          </HolofoilCard>
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-cyan uppercase">
              System relationship
            </p>
            <h1 className="mt-3 max-w-xl font-display text-3xl leading-[1.08] tracking-tight text-fg sm:text-4xl">
              Origin Engine in. Holofoil materials. ARCANA-54 out.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              Holofoil does not mint, sign wallets, deploy contracts, or replace
              ARCANA-54. It is the deterministic material layer between approved
              assets and spatial presentation.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  kicker: "Origin Engine",
                  title: "Inputs from Origin Engine",
                  body: "Approved assets, metadata, QC results and collectible inputs arrive as typed records. Holofoil never authors the source art.",
                },
                {
                  kicker: "Holofoil",
                  title: "Materials rendered here",
                  body: "Deterministic foil configuration, pointer refraction, mobile tilt and exportable JSON another Agentropolis app can consume.",
                },
                {
                  kicker: "ARCANA-54",
                  title: "Spatial presentation downstream",
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
                  <h2 className="mt-3 font-display text-lg">{card.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

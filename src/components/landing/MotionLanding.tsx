import { Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { getHolofoilMediaEngine } from "@/lib/holofoil/media-surfaces";
import {
  LANDING_CHAPTERS,
  LANDING_SECTIONS,
  ensureLandingMedia,
} from "@/data/media-surfaces/landing";
import { LandingClip } from "./LandingClip";

export function MotionLanding() {
  const engine = useMemo(() => getHolofoilMediaEngine(), []);
  useEffect(() => {
    ensureLandingMedia(engine);
  }, [engine]);

  return (
    <main className="bg-bg">
      <section className="relative min-h-[calc(100svh-var(--hf-header))] overflow-hidden">
        <LandingClip surfaceId="surface-hero" engine={engine} className="absolute inset-0 h-full w-full">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-transparent" />
        </LandingClip>
        <div className="relative z-10 flex min-h-[calc(100svh-var(--hf-header))] flex-col justify-end px-4 pb-8 sm:px-8 sm:pb-12">
          <p className="font-mono text-[10px] tracking-[0.28em] text-cyan uppercase">NEURO · Documentary</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[0.95] text-fg sm:text-6xl">
            People × AI × a better tomorrow
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted sm:text-base">
            I’m NEURO, your Holofoil concierge. This is the bio film of the city — then the tools.
            Click any picture to open it and play.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/intake"
              className="inline-flex min-h-11 items-center rounded-full bg-cyan px-5 text-sm font-medium text-bg no-underline"
            >
              Start a project
            </Link>
            <Link
              to="/campus"
              className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm text-fg no-underline"
            >
              Enter campus
            </Link>
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-full border border-cyan/40 px-5 text-sm text-cyan"
              onClick={() => engine.openCinema("surface-hero")}
            >
              Play title film
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-0 lg:grid-cols-2">
        <LandingClip surfaceId="surface-neuro" engine={engine} className="min-h-[52vh] w-full lg:min-h-[70vh]" />
        <div className="flex flex-col justify-center gap-4 px-4 py-10 sm:px-10">
          <p className="font-mono text-[10px] tracking-[0.24em] text-cyan uppercase">NEURO</p>
          <h2 className="font-display text-3xl sm:text-4xl">The concierge, not a second founder</h2>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            You talk to me. I delegate to Holofoil specialists — materials, reconstruction, strategy,
            launch. I never mint, never sign, never skip your approval.
          </p>
          <Link to="/services" className="text-sm text-cyan no-underline">
            View the service buffet →
          </Link>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-8">
        <p className="font-mono text-[10px] tracking-[0.24em] text-cyan uppercase">Bio documentary</p>
        <h2 className="mt-2 font-display text-3xl">Five chapters. One city.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {LANDING_CHAPTERS.map((chapter) => (
            <article key={chapter.surfaceId} className="min-w-0">
              <LandingClip
                surfaceId={chapter.surfaceId}
                engine={engine}
                className="aspect-[4/5] w-full rounded-2xl"
              />
              <p className="mt-3 font-mono text-[10px] tracking-[0.2em] text-cyan uppercase">{chapter.kicker}</p>
              <h3 className="font-display text-xl">{chapter.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{chapter.neuro}</p>
              {chapter.href ? (
                <Link to={chapter.href} className="mt-2 inline-block text-xs text-cyan no-underline">
                  Continue →
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-8">
        <p className="font-mono text-[10px] tracking-[0.24em] text-cyan uppercase">Sections</p>
        <h2 className="mt-2 font-display text-3xl">Every product surface, on film</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {LANDING_SECTIONS.map((section) => (
            <article key={section.surfaceId} className="overflow-hidden rounded-2xl border border-border bg-bg-elevated">
              <LandingClip surfaceId={section.surfaceId} engine={engine} className="aspect-video w-full" />
              <div className="p-4">
                <p className="font-mono text-[10px] tracking-[0.2em] text-cyan uppercase">{section.kicker}</p>
                <h3 className="mt-1 font-display text-2xl">{section.title}</h3>
                <p className="mt-2 text-sm text-muted">{section.neuro}</p>
                {section.href ? (
                  <Link
                    to={section.href}
                    className="mt-4 inline-flex min-h-11 items-center rounded-full bg-cyan px-4 text-sm font-medium text-bg no-underline"
                  >
                    Open
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

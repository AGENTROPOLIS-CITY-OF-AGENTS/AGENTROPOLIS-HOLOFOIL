import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { CONSOLES } from "@/lib/arcade/consoles";
import { prefersReducedMotion } from "@/lib/holofoil/motion";
import { ReducedSnake } from "@/components/arcade/ReducedSnake";

const ConsoleArcade = lazy(() => import("@/components/arcade/ConsoleArcade"));

export const Route = createFileRoute("/arcade")({ component: ArcadeRoute });

function ArcadeRoute() {
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && document.visibilityState === "visible"),
      { threshold: 0.12 },
    );
    io.observe(el);
    const onVis = () => {
      if (document.visibilityState !== "visible") setVisible(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <main ref={hostRef} className="h-[calc(100svh-var(--hf-header))] min-h-0 overflow-hidden">
      {reduced ? (
        <ArcadeReduced />
      ) : (
        <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted">Loading arcade…</div>}>
          <ConsoleArcade visible={visible} />
        </Suspense>
      )}
    </main>
  );
}

function ArcadeReduced() {
  return (
    <div className="h-full overflow-auto bg-[#0a0a0f] px-4 py-8 text-[#f4ead8]">
      <p className="font-mono text-[10px] tracking-[0.28em] text-[#ffcb05] uppercase">Holofoil // Arcade</p>
      <h1 className="mt-2 font-display text-3xl">An ode to GenX gaming</h1>
      <p className="mt-2 max-w-lg text-sm text-[#f4ead8]/70">
        Motion is reduced. 3D booths stay parked. Game Boy Snake still plays on a static screen.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {CONSOLES.map((cfg) => (
          <li key={cfg.id} className="rounded-2xl border border-white/10 p-4">
            <p className="font-display text-xl">{cfg.name}</p>
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#ffcb05] uppercase">{cfg.year}</p>
            <p className="mt-1 text-sm text-[#f4ead8]/70">{cfg.desc}</p>
            {cfg.game === "snake" ? (
              <a href="#snake" className="mt-3 inline-block text-sm text-[#ffcb05]">
                Play Snake →
              </a>
            ) : (
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-[#f4ead8]/40">Cartridge not found</p>
            )}
          </li>
        ))}
      </ul>
      <ReducedSnake />
    </div>
  );
}

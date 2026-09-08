import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  foilLabel,
  hashMaterial,
  type MaterialConfig,
} from "@/lib/holofoil/materials";
import { prefersReducedMotion } from "@/lib/holofoil/motion";

interface HolofoilCardProps {
  material: MaterialConfig;
  title?: string;
  subtitle?: string;
  serial?: string;
  className?: string;
  children?: ReactNode;
  interactive?: boolean;
}

function restPointer(azimuth: number, elevation: number) {
  return {
    x: 0.25 + (azimuth / 360) * 0.5,
    y: 0.2 + ((90 - elevation) / 90) * 0.45,
  };
}

export function HolofoilCard({
  material,
  title,
  subtitle,
  serial,
  className = "",
  children,
  interactive = true,
}: HolofoilCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const rest = useMemo(
    () => restPointer(material.lightAzimuth, material.lightElevation),
    [material.lightAzimuth, material.lightElevation],
  );
  const [pointer, setPointer] = useState(rest);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setPointer(rest);
  }, [rest]);

  const applyPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => setPointer({ x, y }));
    },
    [],
  );

  const resetPointer = useCallback(() => {
    setPointer(rest);
  }, [rest]);

  useEffect(() => {
    if (!interactive || reduced || !material.mobileTilt) return;
    const onOrient = (event: DeviceOrientationEvent) => {
      const gx = ((event.gamma ?? 0) + 45) / 90;
      const gy = ((event.beta ?? 45) - 20) / 70;
      setPointer({
        x: Math.min(1, Math.max(0, gx)),
        y: Math.min(1, Math.max(0, gy)),
      });
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, [interactive, material.mobileTilt, reduced]);

  useEffect(() => {
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const live = interactive && material.pointerResponse && !reduced;
  const tiltX = live ? ((0.5 - pointer.y) * 14 * material.intensity).toFixed(2) : "0";
  const tiltY = live ? ((pointer.x - 0.5) * 18 * material.intensity).toFixed(2) : "0";
  const foilHash = hashMaterial(material);
  const serialMark =
    serial ?? `${material.foilType.slice(0, 3).toUpperCase()}-${foilHash.slice(0, 6).toUpperCase()}`;

  return (
    <article
      ref={rootRef}
      className={`foil-card relative aspect-[63/88] w-full overflow-hidden rounded-[18px] border border-border bg-bg-elevated ${live ? "" : "is-static"} ${className}`}
      style={{
        ["--px" as string]: String(pointer.x),
        ["--py" as string]: String(pointer.y),
        ["--tilt-x" as string]: `${tiltX}deg`,
        ["--tilt-y" as string]: `${tiltY}deg`,
        ["--foil-speed" as string]: String(Math.max(0.12, material.animationSpeed)),
        boxShadow: `0 24px 60px rgb(0 0 0 / 0.45), inset 0 0 0 1px rgb(62 224 255 / ${0.08 + material.fresnel * 0.18})`,
      }}
      onPointerMove={
        live
          ? (event) => applyPointer(event.clientX, event.clientY)
          : undefined
      }
      onPointerLeave={live ? resetPointer : undefined}
      aria-label={`${title ?? "Holofoil specimen"}, ${foilLabel(material.foilType)}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(80% 60% at 50% 18%, color-mix(in oklab, ${material.glowColor} 28%, transparent), #070709 70%)`,
        }}
      />
      <div className="relative z-10 flex h-full flex-col p-4">
        <header className="flex items-start justify-between gap-3 text-[10px] tracking-[0.18em] text-muted uppercase">
          <span>{foilLabel(material.foilType)}</span>
          <span className="font-mono text-cyan">{serialMark}</span>
        </header>
        <div className="mt-4 flex-1 overflow-hidden rounded-[10px] border border-border bg-bg/70">
          {children ?? (
            <DefaultSpecimen
              color={material.glowColor}
              seed={material.seed}
              foilType={material.foilType}
            />
          )}
        </div>
        <footer className="mt-4 space-y-1">
          <p className="font-display text-lg leading-tight text-fg">
            {title ?? "Holofoil Specimen"}
          </p>
          <p className="text-xs text-muted">{subtitle ?? "Deterministic material"}</p>
        </footer>
      </div>
      <div
        className="foil-sheen absolute inset-0 z-20"
        data-type={material.foilType}
        style={{
          opacity: material.opacity * material.intensity,
          filter: `saturate(${0.7 + material.refraction}) blur(${(1 - material.fresnel) * 0.4}px)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-30 mix-blend-overlay"
        style={{
          opacity: material.grain * 0.55,
          backgroundImage:
            "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.05) 0 1px, transparent 1px 3px), repeating-linear-gradient(0deg, rgb(0 0 0 / 0.12) 0 1px, transparent 1px 2px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          boxShadow: `inset 0 0 ${12 + material.fresnel * 28}px color-mix(in oklab, ${material.glowColor} ${20 + material.fresnel * 40}%, transparent)`,
        }}
      />
    </article>
  );
}

function DefaultSpecimen({
  color,
  seed,
  foilType,
}: {
  color: string;
  seed: string;
  foilType: string;
}) {
  const n = seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (
    <div className="relative flex h-full items-center justify-center">
      <div
        className="h-28 w-28 rotate-12 rounded-[28px]"
        style={{
          background: `conic-gradient(from ${n % 360}deg, ${color}, #8b7cff, #070709, ${color})`,
          boxShadow: `0 0 40px color-mix(in oklab, ${color} 45%, transparent)`,
        }}
      />
      <div className="absolute h-16 w-16 rounded-full border border-fg/20 bg-bg/40 backdrop-blur-sm" />
      <p className="absolute bottom-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
        {foilType}
      </p>
    </div>
  );
}

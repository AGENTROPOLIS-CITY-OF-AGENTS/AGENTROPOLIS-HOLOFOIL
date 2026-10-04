"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type {
  HolofoilCardData,
  HolofoilSurfacePreset,
} from "../../contracts/holofoil-card";

function clamp01(value: number | undefined, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}

function clamp(value: number | undefined, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export interface HolofoilSurfaceProps {
  card: HolofoilCardData;
  active?: boolean;
  preset?: HolofoilSurfacePreset;
  onInspect?: (card: HolofoilCardData) => void;
}

export function HolofoilSurface({
  card,
  active = false,
  preset = card.holofoil?.preset ?? "standard",
  onInspect,
}: HolofoilSurfaceProps) {
  const reduceMotion = useReducedMotion();

  const accentA = card.holofoil?.accentA ?? card.holofoil?.accent ?? "#00e5ff";
  const accentB = card.holofoil?.accentB ?? "#ff0058";
  const glow = clamp01(card.holofoil?.glow, 0.45);
  const blur = clamp(card.holofoil?.blur, 0, 48, 22);
  const skewDeg = clamp(card.holofoil?.skewDeg, -24, 24, 15);
  const glassOpacity = clamp01(card.holofoil?.glassOpacity, 0.08);

  if (preset === "skew") {
    return (
      <div className="group relative h-full w-full overflow-visible">
        <motion.div
          aria-hidden="true"
          className="absolute inset-y-0 left-[15%] w-1/2 rounded-lg"
          animate={
            reduceMotion
              ? undefined
              : active
                ? { skewX: 0, left: "7%", width: "72%" }
                : { skewX: skewDeg, left: "15%", width: "50%" }
          }
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{
            background: `linear-gradient(315deg, ${accentA}, ${accentB})`,
          }}
        />

        <motion.div
          aria-hidden="true"
          className="absolute inset-y-0 left-[15%] w-1/2 rounded-lg"
          animate={
            reduceMotion
              ? undefined
              : active
                ? { skewX: 0, left: "7%", width: "72%" }
                : { skewX: skewDeg, left: "15%", width: "50%" }
          }
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{
            background: `linear-gradient(315deg, ${accentA}, ${accentB})`,
            filter: `blur(${blur}px)`,
            opacity: glow,
          }}
        />

        <div className="absolute inset-0 overflow-hidden bg-black/70">
          <img
            src={card.imageSrc}
            alt={card.title}
            draggable={false}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/10" />
        </div>

        <motion.div
          className="relative z-20 flex h-full flex-col justify-end border border-white/10 p-5 text-white backdrop-blur-sm"
          animate={
            reduceMotion
              ? undefined
              : active
                ? { x: -10, y: -4 }
                : { x: 0, y: 0 }
          }
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            background: `rgba(8, 10, 13, ${Math.max(0.3, glassOpacity)})`,
          }}
        >
          <div className="text-[9px] tracking-[0.18em] text-cyan-200">
            {card.game.gameName}
          </div>

          <div className="mt-auto">
            <div className="text-[9px] tracking-[0.2em] text-white/50">
              {card.rarity ?? "UNCLASSIFIED"}
            </div>

            <h3 className="mt-1 text-xl font-semibold tracking-wide">{card.title}</h3>

            {card.subtitle ? (
              <div className="mt-1 text-xs text-cyan-200/80">{card.subtitle}</div>
            ) : null}

            {card.description ? (
              <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-white/65">
                {card.description}
              </p>
            ) : null}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onInspect?.(card);
              }}
              className="mt-4 border border-white/20 bg-white px-3 py-2 text-xs font-semibold tracking-[0.12em] text-black transition hover:bg-cyan-200"
            >
              INSPECT
            </button>
          </div>
        </motion.div>

        {!reduceMotion ? (
          <>
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute left-[10%] top-[5%] z-30 h-20 w-20 rounded-lg border border-white/10 bg-white/10 backdrop-blur-md"
              animate={
                active
                  ? { x: [0, 6, -4, 0], y: [0, -8, 6, 0], opacity: [0.4, 0.8, 0.4] }
                  : { opacity: 0 }
              }
              transition={{ duration: 2.4, repeat: active ? Infinity : 0 }}
            />

            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[5%] right-[10%] z-30 h-20 w-20 rounded-lg border border-white/10 bg-white/10 backdrop-blur-md"
              animate={
                active
                  ? { x: [0, -6, 4, 0], y: [0, 8, -6, 0], opacity: [0.4, 0.8, 0.4] }
                  : { opacity: 0 }
              }
              transition={{ duration: 2.8, repeat: active ? Infinity : 0 }}
            />
          </>
        ) : null}
      </div>
    );
  }

  return <DefaultSurface card={card} active={active} preset={preset} />;
}

function DefaultSurface({
  card,
  active,
  preset,
}: {
  card: HolofoilCardData;
  active: boolean;
  preset: HolofoilSurfacePreset;
}) {
  const accentA = card.holofoil?.accentA ?? card.holofoil?.accent ?? "#00e5ff";
  const accentB = card.holofoil?.accentB ?? "#ff0058";

  const overlay =
    preset === "prism"
      ? `linear-gradient(120deg,transparent 10%,${accentA}33 32%,${accentB}2b 48%,#beff0026 64%,transparent 82%)`
      : preset === "glass"
        ? "linear-gradient(120deg,rgba(255,255,255,.08),transparent 60%)"
        : preset === "relic"
          ? "linear-gradient(120deg,rgba(255,190,90,.22),rgba(90,40,10,.08) 55%,transparent)"
          : preset === "holo"
            ? "linear-gradient(120deg,transparent 8%,rgba(0,255,255,.22) 30%,rgba(255,0,120,.18) 50%,rgba(190,255,0,.15) 68%,transparent 88%)"
            : "linear-gradient(120deg,rgba(255,255,255,.04),transparent 70%)";

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07090d] text-white">
      <img
        src={card.imageSrc}
        alt={card.title}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-screen transition-opacity"
        style={{
          background: overlay,
          opacity: active ? 0.8 : 0.5,
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end p-5">
        <div className="text-[9px] tracking-[0.18em] text-cyan-200">
          {card.game.gameName}
        </div>
        <div className="mt-2 text-[9px] tracking-[0.2em] text-white/50">
          {card.rarity ?? "UNCLASSIFIED"}
        </div>
        <h3 className="mt-1 text-xl font-semibold tracking-wide">{card.title}</h3>
        {card.description ? (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-white/60">
            {card.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

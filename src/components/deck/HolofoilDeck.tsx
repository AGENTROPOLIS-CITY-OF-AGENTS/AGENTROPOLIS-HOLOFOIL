"use client";

import * as React from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import {
  Grid3X3,
  Layers,
  LayoutList,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import type {
  HolofoilCardData,
  HolofoilLayout,
} from "../../contracts/holofoil-card";

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export interface HolofoilDeckProps {
  cards: HolofoilCardData[];
  className?: string;
  defaultLayout?: HolofoilLayout;
  maxVisible?: number;
  initialIndex?: number;
  loop?: boolean;
  cardWidth?: number;
  cardHeight?: number;
  fanSpread?: number;
  overlap?: number;
  perspective?: number;
  depth?: number;
  swipeThreshold?: number;
  autoAdvance?: boolean;
  intervalMs?: number;
  renderCard?: (
    card: HolofoilCardData,
    state: {
      active: boolean;
      expanded: boolean;
      layout: HolofoilLayout;
    },
  ) => React.ReactNode;
  onCardChange?: (card: HolofoilCardData, index: number) => void;
  onCardOpen?: (card: HolofoilCardData) => void;
}

const layoutIcons = {
  fan: Sparkles,
  stack: Layers,
  grid: Grid3X3,
  list: LayoutList,
  inspect: ScanSearch,
};

function wrap(index: number, length: number) {
  return length ? ((index % length) + length) % length : 0;
}

function signedOffset(index: number, active: number, length: number, loop: boolean) {
  const direct = index - active;
  if (!loop || length <= 1) return direct;
  const wrapped = direct > 0 ? direct - length : direct + length;
  return Math.abs(wrapped) < Math.abs(direct) ? wrapped : direct;
}

export function HolofoilDeck({
  cards,
  className,
  defaultLayout = "fan",
  maxVisible = 7,
  initialIndex = 0,
  loop = true,
  cardWidth = 340,
  cardHeight = 480,
  fanSpread = 42,
  overlap = 0.72,
  perspective = 1100,
  depth = 90,
  swipeThreshold = 52,
  autoAdvance = false,
  intervalMs = 3200,
  renderCard,
  onCardChange,
  onCardOpen,
}: HolofoilDeckProps) {
  const reduceMotion = useReducedMotion();
  const [layout, setLayout] = React.useState<HolofoilLayout>(defaultLayout);
  const [activeIndex, setActiveIndex] = React.useState(() => wrap(initialIndex, cards.length));
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [hovering, setHovering] = React.useState(false);

  const length = cards.length;
  const activeCard = length > 0 ? cards[activeIndex] : undefined;

  React.useEffect(() => {
    if (activeCard) onCardChange?.(activeCard, activeIndex);
  }, [activeCard, activeIndex, onCardChange]);

  const previous = React.useCallback(() => {
    if (!length || (!loop && activeIndex === 0)) return;
    setActiveIndex((index) => wrap(index - 1, length));
  }, [activeIndex, length, loop]);

  const next = React.useCallback(() => {
    if (!length || (!loop && activeIndex === length - 1)) return;
    setActiveIndex((index) => wrap(index + 1, length));
  }, [activeIndex, length, loop]);

  React.useEffect(() => {
    if (!autoAdvance || !length || hovering || reduceMotion) return;
    const timer = window.setInterval(next, Math.max(intervalMs, 1000));
    return () => window.clearInterval(timer);
  }, [autoAdvance, hovering, intervalMs, length, next, reduceMotion]);

  if (!length) return null;

  const visibleRadius = Math.max(1, Math.floor(maxVisible / 2));
  const cardSpacing = cardWidth * (1 - overlap);
  const stepAngle = fanSpread / visibleRadius;

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (reduceMotion) return;
    const travel = info.offset.x;
    const velocity = info.velocity.x;
    if (travel < -swipeThreshold || velocity < -650) next();
    if (travel > swipeThreshold || velocity > 650) previous();
  };

  const getCardMotion = (index: number) => {
    const offset = signedOffset(index, activeIndex, length, loop);
    const distance = Math.abs(offset);
    const active = offset === 0;

    if (layout === "fan") {
      return {
        visible: distance <= visibleRadius,
        active,
        x: offset * cardSpacing,
        y: distance * distance * 7,
        z: -distance * depth,
        rotateZ: offset * stepAngle,
        rotateX: active ? 0 : 6,
        scale: active ? 1 : Math.max(0.775, 1 - distance * 0.075),
        opacity: distance > visibleRadius ? 0 : 1,
        zIndex: 100 - distance,
      };
    }

    return {
      visible: true,
      active,
      x: 0,
      y: 0,
      z: 0,
      rotateZ: 0,
      rotateX: 0,
      scale: 1,
      opacity: 1,
      zIndex: active ? 10 : 1,
    };
  };

  return (
    <div
      className={cn("w-full", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="mb-6 flex justify-center">
        <div className="flex gap-1 border border-white/10 bg-black/40 p-1 backdrop-blur-md">
          {(Object.keys(layoutIcons) as HolofoilLayout[]).map((mode) => {
            const Icon = layoutIcons[mode];
            const selected = layout === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setLayout(mode)}
                aria-label={`Switch to ${mode} view`}
                aria-pressed={selected}
                className={cn(
                  "flex h-9 w-9 items-center justify-center transition",
                  selected
                    ? "bg-cyan-400 text-black"
                    : "text-white/50 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      <LayoutGroup>
        <motion.div
          layout
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") previous();
            if (event.key === "ArrowRight") next();
          }}
          className={cn(
            "relative mx-auto",
            layout === "fan" && "flex items-end justify-center",
            layout === "stack" && "h-[34rem] max-w-md",
            layout === "grid" && "grid grid-cols-2 gap-4 md:grid-cols-3",
            layout === "list" && "flex flex-col gap-3",
            layout === "inspect" && "flex justify-center",
          )}
          style={
            layout === "fan"
              ? { height: cardHeight + 100, perspective: `${perspective}px` }
              : undefined
          }
        >
          <AnimatePresence initial={false}>
            {cards.map((card, index) => {
              const state = getCardMotion(index);
              if (layout === "fan" && !state.visible) return null;

              const expanded = expandedId === card.id;
              const active = state.active;

              return (
                <motion.article
                  key={card.id}
                  layoutId={`holofoil:${card.game.gameId}:${card.id}`}
                  drag={active && (layout === "fan" || layout === "stack") ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (!active && layout === "fan") {
                      setActiveIndex(index);
                      return;
                    }
                    setExpandedId(expanded ? null : card.id);
                    onCardOpen?.(card);
                  }}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: 24, scale: 0.92 }
                  }
                  animate={{
                    opacity: state.opacity,
                    x: layout === "fan" ? state.x : 0,
                    y: layout === "fan" ? state.y - (active ? 20 : 0) : 0,
                    rotateZ: state.rotateZ,
                    rotateX: state.rotateX,
                    scale: expanded ? 1.05 : state.scale,
                  }}
                  transition={{
                    type: reduceMotion ? "tween" : "spring",
                    stiffness: 280,
                    damping: 28,
                  }}
                  className={cn(
                    "group overflow-hidden border border-white/10 bg-[#07090d] text-white outline-none",
                    active && "border-cyan-300/50",
                    layout === "fan" && "absolute bottom-0",
                    layout === "stack" && "absolute inset-x-0 mx-auto",
                    layout === "grid" && "relative",
                    layout === "list" && "relative min-h-32",
                    layout === "inspect" && "relative",
                  )}
                  style={{
                    width: layout === "list" ? "100%" : cardWidth,
                    height: layout === "list" ? 150 : cardHeight,
                    zIndex: state.zIndex,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className="h-full w-full"
                    style={{
                      transform: layout === "fan" ? `translateZ(${state.z}px)` : undefined,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {renderCard ? (
                      renderCard(card, { active, expanded, layout })
                    ) : (
                      <HolofoilCard card={card} active={active} />
                    )}
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {length > 1 && layout === "fan" ? (
        <div className="mt-5 flex justify-center gap-2">
          {cards.map((card, index) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View ${card.title}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex
                  ? "w-5 bg-cyan-300"
                  : "w-1.5 bg-white/20 hover:bg-white/40",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HolofoilCard({
  card,
  active,
}: {
  card: HolofoilCardData;
  active: boolean;
}) {
  const rarity = card.rarity ?? "UNCLASSIFIED";

  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={card.imageSrc}
        alt={card.title}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 mix-blend-screen transition-opacity",
          active ? "opacity-80" : "opacity-50",
        )}
        style={{
          background:
            "linear-gradient(120deg,transparent 10%,rgba(0,255,255,.18) 32%,rgba(255,0,100,.14) 48%,rgba(190,255,0,.12) 64%,transparent 82%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

      <div className="absolute left-4 top-4 text-[9px] tracking-[0.18em] text-cyan-200">
        {card.game.gameName}
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end p-5">
        <div className="text-[9px] tracking-[0.2em] text-white/50">{rarity}</div>
        <h3 className="mt-1 text-xl font-semibold tracking-wide">{card.title}</h3>

        {card.subtitle ? (
          <div className="mt-1 text-xs text-cyan-200/80">{card.subtitle}</div>
        ) : null}

        {card.description ? (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-white/60">
            {card.description}
          </p>
        ) : null}

        <div className="mt-4 flex justify-between border-t border-white/10 pt-3 text-[9px] tracking-[0.14em] text-white/45">
          <span>{card.status ?? "ACTIVE"}</span>
          <span>{card.provenance?.verified ? "RECEIPT VERIFIED" : "RECEIPT —"}</span>
        </div>
      </div>
    </div>
  );
}

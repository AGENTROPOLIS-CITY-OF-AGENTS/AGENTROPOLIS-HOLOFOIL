import type { Creature } from "@/lib/holofoil/types";

export function CreatureGlyph({ creature }: { creature: Creature }) {
  return (
    <div className="relative flex h-full items-center justify-center">
      <div
        className="h-32 w-24 rounded-[40%_40%_32%_32%] border"
        style={{
          borderColor: creature.accent,
          background: `linear-gradient(160deg, ${creature.colors[0]}, ${creature.colors[1] ?? creature.accent})`,
          boxShadow: `0 0 40px color-mix(in oklab, ${creature.accent} 40%, transparent)`,
        }}
      />
      <div
        className="absolute h-6 w-10 rounded-full bg-bg/50"
        style={{ top: "38%" }}
      />
    </div>
  );
}

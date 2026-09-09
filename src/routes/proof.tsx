import { createFileRoute } from "@tanstack/react-router";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import type { Group } from "three";
import { HolofoilCard } from "@/components/holofoil/HolofoilCard";
import { SceneLights } from "@/components/holofoil/scene/WorldKit";
import {
  addToLoadout,
  collect,
  initialProof,
  materialFor,
  openReceipt,
  proofReceipt,
  removeFromLoadout,
  revealReward,
  startEncounter,
  strike,
  summon,
  type ProofState,
} from "@/lib/arc54/fixture";
import { playTone } from "@/lib/holofoil/audio";

export const Route = createFileRoute("/proof")({ component: ProofPage });

function ProofPage() {
  const [state, setState] = useState<ProofState>(initialProof);
  const material = useMemo(() => materialFor(state.entity), [state.entity]);
  const receipt = useMemo(() => proofReceipt(state), [state]);
  const show3d = state.phase === "summon" || state.phase === "combat";
  const reveal = state.phase === "reward" || state.phase === "collection" || state.phase === "receipt";

  const act = (next: ProofState, tone: "beep" | "confirm" | "laser" = "beep") => {
    setState(next);
    playTone(tone);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <p className="font-mono text-[11px] tracking-[0.22em] text-lime uppercase">
        Data source: fixture · wallet off · mint off
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight">HOOD TERPS proof</h1>
      <p className="mt-1 text-sm text-muted">
        One canonical entity. ARCANA fixture decides combat. Holofoil presents.
        Canon is PLACEHOLDER.
      </p>
      <p className="mt-2 font-mono text-xs text-cyan">{state.entity.id}</p>

      <ol className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-wider text-muted">
        {["card", "loadout", "encounter", "summon", "combat", "reward", "collection", "receipt"].map(
          (step) => (
            <li
              key={step}
              className={step === state.phase ? "text-cyan" : ""}
            >
              {step}
            </li>
          ),
        )}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
        <HolofoilCard
          material={material}
          title={state.entity.identity.name}
          subtitle={reveal ? "REVEALED" : state.entity.identity.rarity}
          serial={state.entity.id}
        >
          <ReliqMark revealed={reveal} />
        </HolofoilCard>

        <div>
          {show3d ? (
            <div className="mb-6 h-[280px] overflow-hidden rounded-[20px] border border-border bg-bg-elevated">
              <Canvas
                dpr={[1, 1.5]}
                camera={{ position: [3.2, 2.4, 3.2], fov: 40 }}
                gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
                onCreated={({ gl }) => gl.setClearColor("#07090d", 1)}
              >
                <SceneLights />
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                  <circleGeometry args={[3.2, 32]} />
                  <meshBasicMaterial color="#0b0d12" />
                </mesh>
                <ProofProxy striking={state.phase === "combat"} />
                <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.6} />
              </Canvas>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {state.phase === "card" ? (
              <button type="button" className={btn()} onClick={() => act(addToLoadout(state), "confirm")}>
                Add to loadout
              </button>
            ) : null}
            {state.phase === "loadout" ? (
              <>
                <button type="button" className={btn("ghost")} onClick={() => act(removeFromLoadout(state))}>
                  Remove
                </button>
                <button type="button" className={btn()} onClick={() => act(startEncounter(state), "laser")}>
                  Start encounter
                </button>
              </>
            ) : null}
            {state.phase === "encounter" ? (
              <button type="button" className={btn()} onClick={() => act(summon(state), "laser")}>
                Play / summon
              </button>
            ) : null}
            {state.phase === "summon" ? (
              <button type="button" className={btn()} onClick={() => act(strike(state), "laser")}>
                STRIKE
              </button>
            ) : null}
            {state.phase === "combat" ? (
              <button type="button" className={btn()} onClick={() => act(revealReward(state), "confirm")}>
                Reveal reward
              </button>
            ) : null}
            {state.phase === "reward" ? (
              <button type="button" className={btn()} onClick={() => act(collect(state), "confirm")}>
                Open collection
              </button>
            ) : null}
            {state.phase === "collection" ? (
              <button type="button" className={btn()} onClick={() => act(openReceipt(state))}>
                View receipt
              </button>
            ) : null}
          </div>

          {state.combat ? (
            <p className="mt-4 text-sm text-muted">
              ARCANA {state.combat.action} {state.combat.damage} → {state.combat.outcome}. Decided by{" "}
              {state.combat.decidedBy}.
            </p>
          ) : null}

          {state.collection.length ? (
            <p className="mt-2 text-sm text-cyan">
              Collection: {state.collection.join(", ")}
            </p>
          ) : null}

          {state.phase === "receipt" ? (
            <pre className="mt-4 max-h-72 overflow-auto rounded-[16px] border border-border bg-bg-elevated p-4 text-[11px] leading-relaxed text-muted">
              {JSON.stringify(receipt, null, 2)}
            </pre>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function btn(kind: "solid" | "ghost" = "solid") {
  return kind === "solid"
    ? "inline-flex min-h-12 items-center rounded-full bg-cyan px-5 text-sm font-medium text-bg"
    : "inline-flex min-h-12 items-center rounded-full border border-border px-5 text-sm text-fg";
}

function ReliqMark({ revealed }: { revealed: boolean }) {
  return (
    <div className="flex h-full items-center justify-center bg-bg">
      <div
        className="grid size-28 place-items-center rounded-[22px] border"
        style={{
          borderColor: revealed ? "#c4454a" : "#3ee0ff",
          boxShadow: revealed ? "0 0 28px #c4454a66" : "0 0 22px #3ee0ff55",
        }}
      >
        <span className="font-display text-4xl text-cyan">H</span>
      </div>
    </div>
  );
}

function ProofProxy({ striking }: { striking: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);
    if (!ref.current) return;
    ref.current.rotation.y += d * (striking ? 2.4 : 0.6);
    ref.current.position.y = striking ? 0.12 + Math.sin(performance.now() / 90) * 0.08 : 0.08;
  });
  return (
    <group ref={ref} position={[0, 0.08, 0]}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.55, 0.9, 0.35]} />
        <meshBasicMaterial color="#12161c" />
      </mesh>
      <mesh position={[0, 1.28, 0]}>
        <boxGeometry args={[0.38, 0.32, 0.32]} />
        <meshBasicMaterial color="#3ee0ff" />
      </mesh>
      <mesh position={[0.22, 0.72, 0.02]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.12, 0.7, 0.12]} />
        <meshBasicMaterial color="#c4454a" />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.42, 0.4, 0.28]} />
        <meshBasicMaterial color="#1a1c22" />
      </mesh>
    </group>
  );
}

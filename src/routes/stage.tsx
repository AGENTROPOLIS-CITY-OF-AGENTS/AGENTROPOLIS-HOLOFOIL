import { createFileRoute } from "@tanstack/react-router";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Mesh } from "three";
import { HolofoilCard } from "@/components/holofoil/HolofoilCard";
import { playTone } from "@/lib/holofoil/audio";
import {
  applyFoilPreset,
  DEFAULT_MATERIAL,
  foilLabel,
} from "@/lib/holofoil/materials";
import { prefersReducedMotion } from "@/lib/holofoil/motion";
import { MATERIAL_PAVILIONS } from "@/lib/holofoil/pavilions";

export const Route = createFileRoute("/stage")({ component: StagePage });

function StagePage() {
  const [activeId, setActiveId] = useState(MATERIAL_PAVILIONS[0].id);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const pavilion = MATERIAL_PAVILIONS.find((p) => p.id === activeId) ?? MATERIAL_PAVILIONS[0];
  const material = useMemo(
    () =>
      applyFoilPreset(pavilion.foilType, {
        ...DEFAULT_MATERIAL,
        glowColor: pavilion.accent.length === 7 ? pavilion.accent : DEFAULT_MATERIAL.glowColor,
        seed: pavilion.id,
      }),
    [pavilion],
  );

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
      { threshold: 0.15 },
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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <p className="font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">
          3D Stage
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
          Convention pavilions as material rooms.
        </h1>
        <p className="mt-2 text-sm text-muted">
          Cultural halls remain, without third-party inscription catalogs. The
          former inscription booth is now a serialized collectible vault.
        </p>
      </header>

      <div
        ref={hostRef}
        className="relative h-[420px] overflow-hidden rounded-[24px] border border-border bg-bg-elevated"
      >
        {visible ? (
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 3.2, 9], fov: 42 }}
            frameloop={reduced || !visible ? "demand" : "always"}
            gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
            onCreated={({ gl }) => {
              gl.setClearColor("#12161c", 1);
            }}
          >
            <color attach="background" args={["#101014"]} />
            <hemisphereLight args={["#8adfff", "#1a1218", 0.85]} />
            <ambientLight intensity={0.7} />
            <pointLight position={[4, 6, 4]} intensity={40} color="#3ee0ff" />
            <pointLight position={[-6, 3, -2]} intensity={22} color="#8b7cff" />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <circleGeometry args={[12, 48]} />
              <meshBasicMaterial color="#1c242c" toneMapped={false} />
            </mesh>
            <gridHelper args={[18, 18, "#3ee0ff", "#243038"]} />
            <Suspense fallback={null}>
              {MATERIAL_PAVILIONS.map((item, index) => (
                <Booth
                  key={item.id}
                  index={index}
                  selected={item.id === activeId}
                  color={item.accent}
                  reduced={reduced}
                  onSelect={() => {
                    setActiveId(item.id);
                    playTone("laser");
                  }}
                />
              ))}
            </Suspense>
            {!reduced ? <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.05} /> : null}
          </Canvas>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Stage paused while off-screen
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <HolofoilCard
          material={material}
          title={pavilion.name}
          subtitle={foilLabel(pavilion.foilType)}
        />
        <ul className="grid gap-2 sm:grid-cols-2">
          {MATERIAL_PAVILIONS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setActiveId(item.id);
                  playTone("beep");
                }}
                className={`min-h-16 w-full rounded-[16px] border p-3 text-left ${
                  item.id === activeId
                    ? "border-cyan bg-bg-subtle"
                    : "border-border bg-bg-elevated"
                }`}
              >
                <p className="font-display text-base">{item.name}</p>
                <p className="mt-1 text-xs text-muted">{item.summary}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

function Booth({
  index,
  selected,
  color,
  reduced,
  onSelect,
}: {
  index: number;
  selected: boolean;
  color: string;
  reduced: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<Mesh>(null);
  const x = (index % 4) * 3.2 - 4.8;
  const z = Math.floor(index / 4) * 3.4 - 1.6;
  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y += Math.min(delta, 0.1) * (selected ? 1.2 : 0.35);
  });
  return (
    <mesh
      ref={ref}
      position={[x, selected ? 1.4 : 1.1, z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <octahedronGeometry args={[0.95, 0]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

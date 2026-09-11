import { createFileRoute } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { HolofoilCard } from "@/components/holofoil/HolofoilCard";
import { MemberWorkspace } from "@/components/access/MemberWorkspace";
import { DistrictBuilding, Plaza, SceneLights, Skyline, TreePatch } from "@/components/holofoil/scene/WorldKit";
import { WorkAgents } from "@/components/holofoil/scene/WorkAgents";
import { playTone } from "@/lib/holofoil/audio";
import { STAGE_AGENTS } from "@/lib/holofoil/agents";
import {
  applyFoilPreset,
  DEFAULT_MATERIAL,
  foilLabel,
} from "@/lib/holofoil/materials";
import { prefersReducedMotion } from "@/lib/holofoil/motion";
import { MATERIAL_PAVILIONS } from "@/lib/holofoil/pavilions";

export const Route = createFileRoute("/stage")({ component: StageRoute });

function StageRoute() {
  return (
    <MemberWorkspace capability="holofoil.3d-stage.use" title="3D Stage">
      <StagePage />
    </MemberWorkspace>
  );
}

const PAVILION_HOMES = MATERIAL_PAVILIONS.map((item, index) => {
  const angle = (index / MATERIAL_PAVILIONS.length) * Math.PI * 2 - Math.PI / 2;
  return {
    id: item.id,
    name: item.name,
    accent: item.accent,
    position: [Math.cos(angle) * 7.2, 0, Math.sin(angle) * 7.2] as [number, number, number],
    size: [2.4, 2.2 + (index % 3) * 0.35, 2.4] as [number, number, number],
    kind: (index % 2 === 0 ? "hall" : "lab") as "hall" | "lab",
  };
});

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
      ([entry]) =>
        setVisible(entry.isIntersecting && document.visibilityState === "visible"),
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
    <main className="flex h-[calc(100dvh-8.25rem)] min-h-[540px] flex-col">
      <div ref={hostRef} className="relative min-h-0 flex-1 bg-bg">
        {visible ? (
          <Canvas
            className="h-full w-full touch-none"
            dpr={[1, 1.5]}
            camera={{ position: [15, 11, 15], fov: 34, near: 0.1, far: 80 }}
            frameloop={reduced || !visible ? "demand" : "always"}
            gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
            onCreated={({ gl }) => {
              gl.setClearColor("#07090d", 1);
            }}
          >
            <SceneLights />
            <Plaza />
            <Skyline />
            <TreePatch />
            {PAVILION_HOMES.map((home) => (
              <group
                key={home.id}
                position={home.position}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveId(home.id);
                  playTone("laser");
                }}
                onPointerOver={() => {
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "auto";
                }}
              >
                <DistrictBuilding
                  width={home.size[0]}
                  height={home.size[1]}
                  depth={home.size[2]}
                  accent={home.accent}
                  selected={home.id === activeId}
                  kind={home.kind}
                />
                {home.id === activeId ? (
                  <Html
                    position={[0, home.size[1] + 1.2, 0]}
                    center
                    distanceFactor={14}
                    style={{ pointerEvents: "none" }}
                  >
                    <div className="whitespace-nowrap rounded-full border border-cyan bg-bg/90 px-3 py-1 font-mono text-[10px] tracking-[0.16em] text-cyan uppercase">
                      {home.name}
                    </div>
                  </Html>
                ) : null}
              </group>
            ))}
            <WorkAgents homes={PAVILION_HOMES} reduced={reduced} roster={STAGE_AGENTS} />
            {!reduced ? (
              <OrbitControls
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.35}
                minDistance={12}
                maxDistance={26}
                minPolarAngle={Math.PI / 5}
                maxPolarAngle={Math.PI / 2.25}
                target={[0, 1.4, 0]}
              />
            ) : null}
          </Canvas>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Stage paused while off-screen
          </div>
        )}

        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-auto absolute top-3 left-3 max-w-xs rounded-[16px] border border-border bg-bg/80 p-3 backdrop-blur-md">
            <p className="font-mono text-[10px] tracking-[0.2em] text-cyan uppercase">3D Stage</p>
            <p className="mt-1 font-display text-lg">{pavilion.name}</p>
            <p className="text-xs text-muted">{foilLabel(pavilion.foilType)}</p>
          </div>
          <div className="pointer-events-auto absolute top-3 right-3 hidden w-56 lg:block">
            <HolofoilCard
              material={material}
              title={pavilion.name}
              subtitle={foilLabel(pavilion.foilType)}
            />
          </div>
          <div className="pointer-events-auto absolute bottom-3 left-3 right-3 overflow-x-auto">
            <ul className="flex gap-2">
              {MATERIAL_PAVILIONS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(item.id);
                      playTone("beep");
                    }}
                    className={`min-h-11 shrink-0 rounded-full border px-3 text-xs ${
                      item.id === activeId
                        ? "border-cyan bg-bg-subtle text-cyan"
                        : "border-border bg-bg/80 text-muted"
                    }`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

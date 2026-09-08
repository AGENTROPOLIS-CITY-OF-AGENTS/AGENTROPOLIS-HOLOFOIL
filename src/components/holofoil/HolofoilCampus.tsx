import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { playTone } from "@/lib/holofoil/audio";
import { CAMPUS_BUILDINGS, type CampusBuilding } from "@/lib/holofoil/campus";
import { CAMPUS_AGENTS } from "@/lib/holofoil/agents";
import { prefersReducedMotion } from "@/lib/holofoil/motion";
import { DistrictBuilding, Plaza, SceneLights, Skyline, TreePatch } from "@/components/holofoil/scene/WorldKit";
import { WorkAgents } from "@/components/holofoil/scene/WorkAgents";

export function HolofoilCampus() {
  const [selectedId, setSelectedId] = useState("lab");
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const selected =
    CAMPUS_BUILDINGS.find((b) => b.id === selectedId) ?? CAMPUS_BUILDINGS[1];

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

  const enter = (building: CampusBuilding) => {
    if (building.to === "/") {
      setSelectedId(building.id);
      return;
    }
    playTone("confirm");
    void navigate({ to: building.to });
  };

  return (
    <div ref={hostRef} className="relative h-full min-h-[540px] bg-bg">
      {visible ? (
        <Canvas
          className="h-full w-full touch-none"
          dpr={[1, 1.5]}
          camera={{ position: [15, 11.5, 15], fov: 34, near: 0.1, far: 80 }}
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
          {CAMPUS_BUILDINGS.map((building) => (
            <group
              key={building.id}
              position={building.position}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedId(building.id);
                playTone("beep");
              }}
              onPointerOver={() => {
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <DistrictBuilding
                width={building.size[0]}
                height={building.size[1]}
                depth={building.size[2]}
                accent={building.accent}
                selected={building.id === selectedId}
                kind={building.kind}
              />
              {building.id === selectedId ? (
                <Html
                  position={[0, building.size[1] + 1.4, 0]}
                  center
                  distanceFactor={14}
                  style={{ pointerEvents: "none" }}
                >
                  <div className="whitespace-nowrap rounded-full border border-cyan bg-bg/90 px-3 py-1 font-mono text-[10px] tracking-[0.16em] text-cyan uppercase">
                    {building.name}
                  </div>
                </Html>
              ) : null}
            </group>
          ))}
          <WorkAgents homes={CAMPUS_BUILDINGS} reduced={reduced} />
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
          Campus paused while off-screen
        </div>
      )}

      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute top-3 left-3 right-3 flex gap-2 overflow-x-auto md:hidden">
          {CAMPUS_BUILDINGS.filter((b) => b.id !== "core").map((building) => (
            <button
              key={building.id}
              type="button"
              onClick={() => setSelectedId(building.id)}
              className={`min-h-11 shrink-0 rounded-full border px-3 text-xs ${
                building.id === selectedId
                  ? "border-cyan bg-bg-subtle text-cyan"
                  : "border-border bg-bg/80 text-muted"
              }`}
            >
              {building.name}
            </button>
          ))}
        </div>

        <aside className="pointer-events-auto absolute top-3 right-3 bottom-28 hidden w-64 flex-col overflow-hidden rounded-[18px] border border-border bg-bg/80 backdrop-blur-md md:flex">
          <div className="border-b border-border px-4 py-3">
            <p className="font-mono text-[10px] tracking-[0.22em] text-cyan uppercase">
              District
            </p>
            <p className="mt-1 font-display text-lg">Holofoil Campus</p>
          </div>
          <DistrictRadar selectedId={selectedId} />
          <ul className="flex-1 overflow-auto p-2">
            {CAMPUS_BUILDINGS.map((building) => {
              const active = building.id === selectedId;
              return (
                <li key={building.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(building.id);
                      playTone("beep");
                    }}
                    className={`flex min-h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm ${
                      active ? "bg-bg-subtle text-cyan" : "text-muted hover:text-fg"
                    }`}
                  >
                    <span>{building.name}</span>
                    <span
                      className="size-2 rounded-full"
                      style={{ background: building.accent }}
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="pointer-events-none absolute bottom-24 left-3 hidden max-w-sm rounded-[14px] border border-border bg-bg/80 p-3 md:block">
          <p className="font-mono text-[10px] tracking-[0.2em] text-cyan uppercase">Holofoil</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Campus is operational. Select a building. Agents are MOCK — {CAMPUS_AGENTS.length} on duty.
          </p>
        </div>

        <div className="pointer-events-auto absolute bottom-3 left-3 right-3 md:right-72">
          <div className="flex flex-col gap-3 rounded-[18px] border border-border bg-bg/85 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-cyan uppercase">
                Selection
              </p>
              <p className="mt-1 font-display text-xl text-fg">{selected.name}</p>
              <p className="text-sm text-muted">{selected.hint}</p>
            </div>
            {selected.to === "/" ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-lime">
                You are here
              </p>
            ) : (
              <button
                type="button"
                onClick={() => enter(selected)}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan px-5 text-sm font-medium text-bg"
              >
                Enter {selected.name}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DistrictRadar({ selectedId }: { selectedId: string }) {
  const cx = 78;
  const cy = 78;
  const r = 54;
  return (
    <svg viewBox="0 0 156 156" className="mx-auto mt-2 h-36 w-36 text-cyan">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1c2a32" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#1c2a32" />
      <circle cx={cx} cy={cy} r={3} fill="#3ee0ff" />
      {CAMPUS_BUILDINGS.map((b) => {
        const max = 8;
        const x = cx + (b.position[0] / max) * r;
        const y = cy + (b.position[2] / max) * r;
        return (
          <circle
            key={b.id}
            cx={x}
            cy={y}
            r={b.id === selectedId ? 5 : 3.2}
            fill={b.accent}
          />
        );
      })}
    </svg>
  );
}

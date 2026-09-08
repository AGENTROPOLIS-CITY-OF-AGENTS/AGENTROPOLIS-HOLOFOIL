import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import { playTone } from "@/lib/holofoil/audio";
import { CAMPUS_BUILDINGS, type CampusBuilding } from "@/lib/holofoil/campus";
import { prefersReducedMotion } from "@/lib/holofoil/motion";

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
          camera={{ position: [16, 12, 16], fov: 36, near: 0.1, far: 80 }}
          frameloop={reduced || !visible ? "demand" : "always"}
          gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
          onCreated={({ gl }) => {
            gl.setClearColor("#070709", 1);
          }}
        >
          <color attach="background" args={["#070709"]} />
          <fog attach="fog" args={["#070709", 22, 48]} />
          <ambientLight intensity={0.62} />
          <directionalLight position={[10, 18, 8]} intensity={1.35} color="#d7f6ff" />
          <pointLight position={[0, 7, 0]} intensity={28} color="#3ee0ff" distance={20} />
          <pointLight position={[-9, 4, 8]} intensity={16} color="#c4454a" distance={18} />
          <Plaza />
          <CityRing />
          {CAMPUS_BUILDINGS.map((building) => (
            <BuildingMesh
              key={building.id}
              building={building}
              selected={building.id === selectedId}
              reduced={reduced}
              onSelect={() => {
                setSelectedId(building.id);
                playTone("beep");
              }}
            />
          ))}
          {!reduced ? (
            <OrbitControls
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.45}
              minDistance={12}
              maxDistance={28}
              minPolarAngle={Math.PI / 5}
              maxPolarAngle={Math.PI / 2.25}
              target={[0, 1.6, 0]}
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

        <aside className="pointer-events-auto absolute top-3 right-3 bottom-3 hidden w-64 flex-col overflow-hidden rounded-[18px] border border-border bg-bg/80 backdrop-blur-md md:flex">
          <div className="border-b border-border px-4 py-3">
            <p className="font-mono text-[10px] tracking-[0.22em] text-cyan uppercase">
              District
            </p>
            <p className="mt-1 font-display text-lg">Holofoil Campus</p>
          </div>
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
                      active
                        ? "bg-bg-subtle text-cyan"
                        : "text-muted hover:text-fg"
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

function Plaza() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[13.5, 64]} />
        <meshBasicMaterial color="#0b0d11" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[8.6, 9.15, 64]} />
        <meshBasicMaterial color="#3ee0ff" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[4.2, 4.45, 64]} />
        <meshBasicMaterial color="#c4454a" transparent opacity={0.28} />
      </mesh>
      <gridHelper args={[26, 26, "#163038", "#101418"]} position={[0, 0.02, 0]} />
    </group>
  );
}

function CityRing() {
  const blocks = useMemo(() => {
    const out: { x: number; z: number; h: number; w: number }[] = [];
    for (let i = 0; i < 22; i += 1) {
      const a = (i / 22) * Math.PI * 2;
      const r = 18 + (i % 3) * 1.4;
      out.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        h: 3 + ((i * 17) % 9),
        w: 1.1 + (i % 3) * 0.4,
      });
    }
    return out;
  }, []);
  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.w]} />
          <meshBasicMaterial color={i % 5 === 0 ? "#101820" : "#0c1016"} />
        </mesh>
      ))}
    </group>
  );
}

function BuildingMesh({
  building,
  selected,
  reduced,
  onSelect,
}: {
  building: CampusBuilding;
  selected: boolean;
  reduced: boolean;
  onSelect: () => void;
}) {
  const group = useRef<Group>(null);
  const [w, h, d] = building.size;

  useFrame((_, delta) => {
    if (!group.current || reduced) return;
    if (selected) {
      group.current.position.y = Math.sin(performance.now() / 420) * 0.06;
    } else {
      group.current.position.y += (0 - group.current.position.y) * Math.min(1, delta * 6);
    }
  });

  return (
    <group
      ref={group}
      position={building.position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshLambertMaterial
          color={selected ? "#182028" : "#12161c"}
          emissive={building.accent}
          emissiveIntensity={selected ? 0.22 : 0.06}
        />
      </mesh>
      <mesh position={[0, h + 0.1, 0]}>
        <boxGeometry args={[w + 0.18, 0.22, d + 0.18]} />
        <meshBasicMaterial color={building.accent} />
      </mesh>
      {building.kind === "tower" ? (
        <mesh position={[0, h + 1.1, 0]}>
          <boxGeometry args={[0.7, 2.0, 0.7]} />
          <meshBasicMaterial color="#3ee0ff" />
        </mesh>
      ) : null}
      <WindowGrid width={w} height={h} depth={d} accent={building.accent} />
      {selected ? (
        <Html position={[0, h + 0.7, 0]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-full border border-cyan bg-bg/90 px-3 py-1 font-mono text-[10px] tracking-[0.16em] text-cyan uppercase">
            {building.name}
          </div>
        </Html>
      ) : null}
    </group>
  );
}

function WindowGrid({
  width,
  height,
  depth,
  accent,
}: {
  width: number;
  height: number;
  depth: number;
  accent: string;
}) {
  const panes = useMemo(() => {
    const cols = 3;
    const rows = Math.max(2, Math.floor(height));
    const items: [number, number, number][] = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = (c - (cols - 1) / 2) * (width * 0.22);
        const y = 0.45 + r * (height / (rows + 0.6));
        items.push([x, y, depth / 2 + 0.03]);
      }
    }
    return items;
  }, [width, height, depth]);

  return (
    <group>
      {panes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <planeGeometry args={[0.22, 0.28]} />
          <meshBasicMaterial color={i % 4 === 0 ? accent : "#1e2a32"} />
        </mesh>
      ))}
    </group>
  );
}

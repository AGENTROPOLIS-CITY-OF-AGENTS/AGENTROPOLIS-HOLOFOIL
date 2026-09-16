import { ContactShadows, Grid } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { CONSOLES, type ConsoleConfig } from "@/lib/arcade/consoles";
import {
  DIR_FROM_KEY,
  SNAKE_CELL,
  SNAKE_TICK_MS,
  createSnake,
  queueDir,
  stepSnake,
  type SnakeState,
} from "@/lib/arcade/snake";

const ARC_RADIUS = 5.5;
const ARC_SPAN = Math.PI * 0.9;
const CAM_HOME = new THREE.Vector3(0, 0.5, 7);
const CAM_LOOK_HOME = new THREE.Vector3(0, 0, 0);
const TMP_SCALE = new THREE.Vector3();

type ScreenData = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; texture: THREE.CanvasTexture };

function makeScreenData(width = 256, height = 224): ScreenData {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return { canvas, ctx, texture };
}

function drawIdleScreen(ctx: CanvasRenderingContext2D, cfg: ConsoleConfig) {
  const c = ctx.canvas;
  ctx.fillStyle = cfg.screen;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  for (let y = 0; y < c.height; y += 2) ctx.fillRect(0, y, c.width, 1);
  ctx.fillStyle = cfg.id === "gameboy" ? "#0a3a0a" : "#ffcb05";
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.fillText(cfg.name.toUpperCase(), c.width / 2, c.height / 2 - 10);
  ctx.font = "14px monospace";
  ctx.fillText(cfg.game === "snake" ? "▶ PRESS START" : "INSERT CARTRIDGE", c.width / 2, c.height / 2 + 14);
  ctx.font = "10px monospace";
  ctx.fillText(cfg.year, c.width / 2, c.height - 12);
}

function drawSnake(screen: ScreenData, state: SnakeState) {
  const { ctx, canvas } = screen;
  ctx.fillStyle = "#9bbc0f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0f380f";
  ctx.fillRect(state.food.x * SNAKE_CELL + 1, state.food.y * SNAKE_CELL + 1, SNAKE_CELL - 2, SNAKE_CELL - 2);
  state.snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "#0f380f" : "#306230";
    ctx.fillRect(seg.x * SNAKE_CELL + 1, seg.y * SNAKE_CELL + 1, SNAKE_CELL - 2, SNAKE_CELL - 2);
  });
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  for (let y = 0; y < canvas.height; y += 2) ctx.fillRect(0, y, canvas.width, 1);
  ctx.fillStyle = "#0f380f";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`SCORE ${state.score}`, 4, 14);
  if (!state.alive) {
    ctx.textAlign = "center";
    ctx.font = "bold 22px monospace";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 8);
    ctx.font = "14px monospace";
    ctx.fillText("R TO RESTART", canvas.width / 2, canvas.height / 2 + 18);
  }
  screen.texture.needsUpdate = true;
}

function useTiltAndFloat(
  ref: RefObject<THREE.Group | null>,
  baseRotY: number,
  isActive: boolean,
  mouse: MutableRefObject<{ x: number; y: number }>,
  mode: "arcade" | "playing",
  index: number,
) {
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    if (mode === "arcade" && isActive) {
      g.rotation.x += (-mouse.current.y * 0.25 - g.rotation.x) * 0.08;
      g.rotation.y += (mouse.current.x * 0.3 + baseRotY - g.rotation.y) * 0.08;
    } else {
      g.rotation.x += (Math.sin(t * 0.5 + index) * 0.04 - g.rotation.x) * 0.05;
      g.rotation.y += (baseRotY - g.rotation.y) * 0.05;
    }
    const target = isActive ? 1 : 0.78;
    g.scale.lerp(TMP_SCALE.set(target, target, target), 0.1);
  });
}

function GameBoyMesh({
  cfg,
  screen,
  isActive,
  mouse,
  mode,
  baseRotY,
  index,
}: {
  cfg: ConsoleConfig;
  screen: ScreenData;
  isActive: boolean;
  mouse: MutableRefObject<{ x: number; y: number }>;
  mode: "arcade" | "playing";
  baseRotY: number;
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  useTiltAndFloat(group, baseRotY, isActive, mouse, mode, index);
  return (
    <group ref={group}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 2.4, 0.25]} />
        <meshStandardMaterial color={cfg.color} roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.5, 0.13]}>
        <boxGeometry args={[1.3, 1.2, 0.05]} />
        <meshStandardMaterial color="#7a7a7a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.55, 0.16]}>
        <planeGeometry args={[0.9, 0.85]} />
        <meshBasicMaterial map={screen.texture} toneMapped={false} />
      </mesh>
      <mesh position={[-0.5, 0.95, 0.16]}>
        <circleGeometry args={[0.02, 16]} />
        <meshBasicMaterial color="#ee1515" />
      </mesh>
      <mesh position={[-0.42, -0.55, 0.13]}>
        <boxGeometry args={[0.08, 0.28, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.42, -0.55, 0.13]}>
        <boxGeometry args={[0.28, 0.08, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.55, -0.45, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 24]} />
        <meshStandardMaterial color={cfg.accent} roughness={0.4} />
      </mesh>
      <mesh position={[0.35, -0.6, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 24]} />
        <meshStandardMaterial color={cfg.accent} roughness={0.4} />
      </mesh>
    </group>
  );
}

function TVConsoleMesh({
  cfg,
  screen,
  isActive,
  mouse,
  mode,
  baseRotY,
  index,
}: {
  cfg: ConsoleConfig;
  screen: ScreenData;
  isActive: boolean;
  mouse: MutableRefObject<{ x: number; y: number }>;
  mode: "arcade" | "playing";
  baseRotY: number;
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  useTiltAndFloat(group, baseRotY, isActive, mouse, mode, index);
  return (
    <group ref={group}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.7, 1.4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.45, 0.71]}>
        <planeGeometry args={[1.8, 1.3]} />
        <meshBasicMaterial map={screen.texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.65, 0]} castShadow>
        <boxGeometry args={[2.0, 0.4, 1.0]} />
        <meshStandardMaterial color={cfg.color} roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[2.01, 0.06, 1.01]} />
        <meshStandardMaterial color={cfg.accent} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, -1.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.4, 1.5, 0.3, 32]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

function ConsoleStation({
  cfg,
  index,
  total,
  isActive,
  mouse,
  mode,
  onScreenReady,
  onClick,
}: {
  cfg: ConsoleConfig;
  index: number;
  total: number;
  isActive: boolean;
  mouse: MutableRefObject<{ x: number; y: number }>;
  mode: "arcade" | "playing";
  onScreenReady: (idx: number, screen: ScreenData) => void;
  onClick: () => void;
}) {
  const screen = useMemo(() => makeScreenData(256, 224), []);
  const wrap = useRef<THREE.Group>(null);
  const { x, z, baseRotY } = useMemo(() => {
    const t = index / (total - 1);
    const angle = -ARC_SPAN / 2 + t * ARC_SPAN;
    return {
      x: Math.sin(angle) * ARC_RADIUS,
      z: -Math.cos(angle) * ARC_RADIUS + ARC_RADIUS - 1,
      baseRotY: -angle * 0.7,
    };
  }, [index, total]);

  useEffect(() => {
    drawIdleScreen(screen.ctx, cfg);
    screen.texture.needsUpdate = true;
    onScreenReady(index, screen);
    return () => {
      screen.texture.dispose();
    };
  }, [cfg, index, onScreenReady, screen]);

  useFrame((state) => {
    if (!wrap.current) return;
    const t = state.clock.elapsedTime;
    wrap.current.position.y = Math.sin(t * 0.8 + index * 0.7) * 0.06 + (isActive ? 0.1 : 0);
  });

  const Inner = cfg.id === "gameboy" ? GameBoyMesh : TVConsoleMesh;
  return (
    <group
      ref={wrap}
      position={[x, 0, z]}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <Inner cfg={cfg} screen={screen} isActive={isActive} mouse={mouse} mode={mode} baseRotY={baseRotY} index={index} />
      <pointLight position={[0, -1.3, 0]} color={cfg.accent} intensity={0.6} distance={4} />
    </group>
  );
}

function CameraRig({
  zoomTarget,
  zoomLook,
  mouse,
  mode,
}: {
  zoomTarget: THREE.Vector3;
  zoomLook: THREE.Vector3;
  mouse: MutableRefObject<{ x: number; y: number }>;
  mode: "arcade" | "playing";
}) {
  const { camera } = useThree();
  const currentLook = useRef(new THREE.Vector3().copy(CAM_LOOK_HOME));
  useFrame(() => {
    camera.position.lerp(zoomTarget, 0.06);
    currentLook.current.lerp(zoomLook, 0.06);
    camera.lookAt(currentLook.current);
    if (mode === "arcade") {
      camera.position.x += mouse.current.x * 0.006;
    }
  });
  return null;
}

function ArcGroup({ activeIdx, total, children }: { activeIdx: number; total: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const target = -(-ARC_SPAN / 2 + (activeIdx / (total - 1)) * ARC_SPAN);
    ref.current.rotation.y += (target - ref.current.rotation.y) * 0.08;
  });
  return <group ref={ref}>{children}</group>;
}

function SnakeLoop({
  active,
  screen,
  onScore,
}: {
  active: boolean;
  screen: ScreenData | null;
  onScore: (n: number) => void;
}) {
  const state = useRef<SnakeState | null>(null);
  const acc = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (!active || !screen) {
      state.current = null;
      return;
    }
    const cols = Math.floor(screen.canvas.width / SNAKE_CELL);
    const rows = Math.floor(screen.canvas.height / SNAKE_CELL);
    state.current = createSnake(cols, rows);
    scoreRef.current = 0;
    onScore(0);
    drawSnake(screen, state.current);
  }, [active, onScore, screen]);

  useFrame((_, delta) => {
    if (!active || !screen || !state.current) return;
    acc.current += Math.min(delta, 0.1) * 1000;
    let dirty = false;
    while (acc.current >= SNAKE_TICK_MS) {
      acc.current -= SNAKE_TICK_MS;
      if (state.current.alive) {
        state.current = stepSnake(state.current);
        if (state.current.score !== scoreRef.current) {
          scoreRef.current = state.current.score;
          onScore(state.current.score);
        }
        dirty = true;
      }
    }
    if (dirty) drawSnake(screen, state.current);
  });

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (!state.current || !screen) return;
      if ((event.key === "r" || event.key === "R") && !state.current.alive) {
        state.current = createSnake(state.current.cols, state.current.rows);
        scoreRef.current = 0;
        onScore(0);
        drawSnake(screen, state.current);
        return;
      }
      const dir = DIR_FROM_KEY[event.key];
      if (dir) state.current = queueDir(state.current, dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onScore, screen]);

  return null;
}

function StubLoop({ active, screen, cfg }: { active: boolean; screen: ScreenData | null; cfg: ConsoleConfig }) {
  const frame = useRef(0);
  useFrame((_, delta) => {
    if (!active || !screen) return;
    frame.current += delta;
    if (frame.current < 0.22) return;
    frame.current = 0;
    const { ctx, canvas } = screen;
    ctx.fillStyle = cfg.screen;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = cfg.accent;
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText(cfg.name.toUpperCase(), canvas.width / 2, 40);
    ctx.fillStyle = "#f4ead8";
    ctx.font = "14px monospace";
    ctx.fillText("◉ CARTRIDGE NOT FOUND", canvas.width / 2, canvas.height / 2);
    ctx.fillText("GAME COMING SOON", canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("PRESS ESC TO EXIT", canvas.width / 2, canvas.height - 16);
    screen.texture.needsUpdate = true;
  });
  return null;
}

export default function ConsoleArcade({ visible }: { visible: boolean }) {
  const [activeIdx, setActiveIdx] = useState(4);
  const [mode, setMode] = useState<"arcade" | "playing">("arcade");
  const [score, setScore] = useState(0);
  const screensRef = useRef<Map<number, ScreenData>>(new Map());
  const mouse = useRef({ x: 0, y: 0 });
  const [zoomTarget] = useState(() => new THREE.Vector3().copy(CAM_HOME));
  const [zoomLook] = useState(() => new THREE.Vector3().copy(CAM_LOOK_HOME));
  const [activeScreen, setActiveScreen] = useState<ScreenData | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const activeCfg = CONSOLES[activeIdx];

  useEffect(() => {
    setActiveScreen(screensRef.current.get(activeIdx) ?? null);
  }, [activeIdx]);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const enterConsole = useCallback(() => {
    setMode("playing");
    const handheld = activeCfg.id === "gameboy";
    zoomTarget.set(0, handheld ? 1 : 0.85, handheld ? 2.2 : 3);
    zoomLook.set(0, handheld ? 0.55 : 0.45, 0);
  }, [activeCfg, zoomLook, zoomTarget]);

  const exitConsole = useCallback(() => {
    setMode("arcade");
    zoomTarget.copy(CAM_HOME);
    zoomLook.copy(CAM_LOOK_HOME);
    setScore(0);
    const screen = screensRef.current.get(activeIdx);
    if (screen) {
      drawIdleScreen(screen.ctx, activeCfg);
      screen.texture.needsUpdate = true;
    }
  }, [activeCfg, activeIdx, zoomLook, zoomTarget]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (mode === "arcade") {
        if (event.key === "ArrowLeft") setActiveIdx((i) => Math.max(0, i - 1));
        if (event.key === "ArrowRight") setActiveIdx((i) => Math.min(CONSOLES.length - 1, i + 1));
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          enterConsole();
        }
      } else if (event.key === "Escape") {
        exitConsole();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterConsole, exitConsole, mode]);

  const handleScreenReady = useCallback((idx: number, screen: ScreenData) => {
    screensRef.current.set(idx, screen);
    if (idx === activeIdx) setActiveScreen(screen);
  }, [activeIdx]);

  const nudge = (dir: { x: number; y: number }) => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: dir.y < 0 ? "ArrowUp" : dir.y > 0 ? "ArrowDown" : dir.x < 0 ? "ArrowLeft" : "ArrowRight",
      }),
    );
  };

  return (
    <div ref={hostRef} className="relative h-full min-h-0 overflow-hidden bg-[#0a0a0f] text-[#f4ead8]">
      <Canvas
        className="h-full w-full touch-none"
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.5, 7], fov: 45 }}
        frameloop={visible ? "always" : "demand"}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <fog attach="fog" args={["#0a0a0f", 8, 22]} />
        <ambientLight intensity={0.4} color="#3a3a55" />
        <directionalLight position={[3, 6, 4]} intensity={1.2} color="#ffcb05" castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#ee1515" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#0a0a0f" roughness={0.4} metalness={0.3} />
        </mesh>
        <Grid
          position={[0, -1.99, 0]}
          args={[40, 40]}
          cellColor="#1a1a2a"
          sectionColor="#ffcb05"
          fadeDistance={20}
          fadeStrength={1.5}
          cellSize={1}
          sectionSize={4}
          cellThickness={0.5}
        />
        <ArcGroup activeIdx={activeIdx} total={CONSOLES.length}>
          {CONSOLES.map((cfg, i) => (
            <ConsoleStation
              key={cfg.id}
              cfg={cfg}
              index={i}
              total={CONSOLES.length}
              isActive={i === activeIdx}
              mouse={mouse}
              mode={mode}
              onScreenReady={handleScreenReady}
              onClick={() => {
                if (mode !== "arcade") return;
                if (i === activeIdx) enterConsole();
                else setActiveIdx(i);
              }}
            />
          ))}
        </ArcGroup>
        <ContactShadows position={[0, -1.99, 0]} opacity={0.4} scale={20} blur={2} far={4} />
        <CameraRig zoomTarget={zoomTarget} zoomLook={zoomLook} mouse={mouse} mode={mode} />
        <SnakeLoop
          active={visible && mode === "playing" && activeCfg.game === "snake"}
          screen={activeScreen}
          onScore={setScore}
        />
        <StubLoop active={visible && mode === "playing" && activeCfg.game === "stub"} screen={activeScreen} cfg={activeCfg} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 sm:p-6">
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase">
          <span className="text-[#ffcb05]">HOLO</span>
          <span className="text-[#ee1515]">FOIL</span>
          {" // ARCADE"}
          <p className="mt-1 font-display text-sm tracking-normal text-[#f4ead8]/70 normal-case">
            An ode to GenX gaming
          </p>
        </div>
        <p className="font-mono text-sm">
          BOOTH <span className="text-[#ffcb05]">{String(activeIdx + 1).padStart(2, "0")}</span> /{" "}
          {String(CONSOLES.length).padStart(2, "0")}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex items-end justify-between p-4 sm:bottom-6 sm:p-6">
        <div className="max-w-sm">
          <p className="font-display text-3xl leading-none sm:text-4xl">{activeCfg.name}</p>
          <p className="mt-2 font-mono text-[10px] tracking-[0.28em] text-[#ffcb05] uppercase">{activeCfg.year}</p>
          <p className="mt-1 font-mono text-sm text-[#f4ead8]/70">{activeCfg.desc}</p>
        </div>
        {mode === "arcade" ? (
          <button
            type="button"
            className="pointer-events-auto inline-flex min-h-11 items-center rounded-full bg-[#ffcb05] px-4 text-sm font-medium text-black"
            onClick={enterConsole}
          >
            Press Start
          </button>
        ) : null}
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-3">
        {CONSOLES.map((cfg, i) => (
          <button
            key={cfg.id}
            type="button"
            aria-label={cfg.name}
            onClick={() => mode === "arcade" && setActiveIdx(i)}
            className={`size-2 rounded-full ${i === activeIdx ? "scale-150 bg-[#ffcb05]" : "bg-[#f4ead8]/25"}`}
          />
        ))}
      </div>

      {mode === "playing" ? (
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
          <button
            type="button"
            onClick={exitConsole}
            className="self-start min-h-11 rounded border border-[#ffcb05] bg-black/40 px-4 font-mono text-[10px] tracking-[0.2em] text-[#ffcb05] uppercase"
          >
            Esc · Return to arcade
          </button>
          <p className="text-center font-mono text-xl">
            {activeCfg.game === "snake" ? `SCORE ${score}` : "INSERT CARTRIDGE"}
          </p>
          {activeCfg.game === "snake" ? (
            <div className="grid grid-cols-3 gap-2 self-center pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
              <span />
              <button type="button" className="min-h-11 rounded bg-[#ffcb05] text-black" onClick={() => nudge({ x: 0, y: -1 })}>
                ↑
              </button>
              <span />
              <button type="button" className="min-h-11 rounded bg-[#ffcb05] text-black" onClick={() => nudge({ x: -1, y: 0 })}>
                ←
              </button>
              <button type="button" className="min-h-11 rounded bg-[#ffcb05] text-black" onClick={() => nudge({ x: 0, y: 1 })}>
                ↓
              </button>
              <button type="button" className="min-h-11 rounded bg-[#ffcb05] text-black" onClick={() => nudge({ x: 1, y: 0 })}>
                →
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

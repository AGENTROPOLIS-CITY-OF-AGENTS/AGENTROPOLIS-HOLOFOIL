import { useMemo } from "react";

export function SceneLights() {
  return (
    <>
      <color attach="background" args={["#07090d"]} />
      <fog attach="fog" args={["#07090d", 20, 52]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#8adfff", "#1a1218", 0.55]} />
      <directionalLight position={[12, 20, 8]} intensity={1.15} color="#e7f6ff" />
      <pointLight position={[0, 8, 0]} intensity={22} color="#3ee0ff" distance={22} />
      <pointLight position={[-10, 5, 8]} intensity={14} color="#c4454a" distance={18} />
    </>
  );
}

export function Plaza({ radius = 13.5 }: { radius?: number }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <circleGeometry args={[radius, 72]} />
        <meshBasicMaterial color="#0b0d12" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[radius * 0.64, radius * 0.685, 72]} />
        <meshBasicMaterial color="#3ee0ff" transparent opacity={0.32} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[radius * 0.31, radius * 0.335, 64]} />
        <meshBasicMaterial color="#c4454a" transparent opacity={0.26} />
      </mesh>
      <gridHelper args={[28, 28, "#143038", "#0e1218"]} position={[0, 0.01, 0]} />
    </group>
  );
}

export function Skyline() {
  const blocks = useMemo(() => {
    const out: { x: number; z: number; h: number; w: number; d: number; lit: boolean }[] = [];
    for (let i = 0; i < 28; i += 1) {
      const a = (i / 28) * Math.PI * 2 + 0.11;
      const r = 19.5 + (i % 4) * 1.5;
      out.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        h: 4 + ((i * 13) % 11),
        w: 1.1 + (i % 3) * 0.45,
        d: 1.0 + ((i * 5) % 3) * 0.35,
        lit: i % 3 !== 1,
      });
    }
    return out;
  }, []);
  return (
    <group>
      {blocks.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshBasicMaterial color={b.lit ? "#101820" : "#0c1016"} />
          </mesh>
          {b.lit ? (
            <mesh position={[0, b.h * 0.62, b.d / 2 + 0.02]}>
              <planeGeometry args={[b.w * 0.55, 0.18]} />
              <meshBasicMaterial color="#3ee0ff" transparent opacity={0.35} />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
}

export function TreePatch() {
  const trees = useMemo(() => {
    const out: { x: number; z: number; s: number }[] = [];
    for (let i = 0; i < 18; i += 1) {
      const a = (i / 18) * Math.PI * 2 + 0.4;
      const r = 5.6 + (i % 2) * 1.15;
      out.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.85 + (i % 3) * 0.12 });
    }
    return out;
  }, []);
  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 0.44, 6]} />
            <meshBasicMaterial color="#2a2118" />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <coneGeometry args={[0.32, 0.7, 7]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#7dff6a" : "#c6e34a"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function DistrictBuilding({
  width,
  height,
  depth,
  accent,
  selected,
  kind,
}: {
  width: number;
  height: number;
  depth: number;
  accent: string;
  selected: boolean;
  kind: "tower" | "lab" | "hall" | "vault";
}) {
  const body = selected ? "#18222c" : "#12161c";
  const podiumH = 0.42;
  const mainH = height - podiumH;
  return (
    <group>
      <mesh position={[0, podiumH / 2, 0]}>
        <boxGeometry args={[width + 0.55, podiumH, depth + 0.55]} />
        <meshLambertMaterial color="#0e1218" emissive={accent} emissiveIntensity={0.04} />
      </mesh>
      <mesh position={[0, podiumH + mainH / 2, 0]}>
        <boxGeometry args={[width, mainH, depth]} />
        <meshLambertMaterial color={body} emissive={accent} emissiveIntensity={selected ? 0.18 : 0.05} />
      </mesh>
      <mesh position={[0, height + 0.1, 0]}>
        <boxGeometry args={[width + 0.2, 0.2, depth + 0.2]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <mesh position={[0, height * 0.55, depth / 2 + 0.03]}>
        <boxGeometry args={[width * 0.72, 0.28, 0.06]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <WindowBand width={width} height={height} depth={depth} accent={accent} />
      {kind === "tower" ? (
        <>
          <mesh position={[0, height + 0.85, 0]}>
            <boxGeometry args={[width * 0.42, 1.4, depth * 0.42]} />
            <meshBasicMaterial color="#3ee0ff" />
          </mesh>
          <mesh position={[0, height + 1.85, 0]}>
            <boxGeometry args={[0.12, 1.1, 0.12]} />
            <meshBasicMaterial color="#e8eef2" />
          </mesh>
        </>
      ) : null}
      {kind === "hall" ? (
        <mesh position={[width * 0.42, 0.9, 0]}>
          <boxGeometry args={[width * 0.35, 1.6, depth * 0.7]} />
          <meshLambertMaterial color="#161b22" emissive={accent} emissiveIntensity={0.08} />
        </mesh>
      ) : null}
      {kind === "lab" ? (
        <mesh position={[0, height + 0.55, 0]}>
          <octahedronGeometry args={[0.38, 0]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      ) : null}
      <mesh position={[width * 0.28, height + 0.28, -depth * 0.22]}>
        <boxGeometry args={[0.28, 0.22, 0.22]} />
        <meshBasicMaterial color="#1c242c" />
      </mesh>
    </group>
  );
}

function WindowBand({
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
    const cols = 4;
    const rows = Math.max(3, Math.floor(height + 1));
    const faces: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const y = 0.55 + r * (height / (rows + 0.4));
        const u = (c - (cols - 1) / 2) / cols;
        faces.push({ pos: [u * width * 0.72, y, depth / 2 + 0.04], rot: [0, 0, 0] });
        faces.push({ pos: [u * width * 0.72, y, -depth / 2 - 0.04], rot: [0, Math.PI, 0] });
        faces.push({ pos: [width / 2 + 0.04, y, u * depth * 0.72], rot: [0, Math.PI / 2, 0] });
        faces.push({ pos: [-width / 2 - 0.04, y, u * depth * 0.72], rot: [0, -Math.PI / 2, 0] });
      }
    }
    return faces;
  }, [width, height, depth]);

  return (
    <group>
      {panes.map((pane, i) => (
        <mesh key={i} position={pane.pos} rotation={pane.rot}>
          <planeGeometry args={[0.16, 0.22]} />
          <meshBasicMaterial color={i % 5 === 0 ? accent : "#1a2830"} />
        </mesh>
      ))}
    </group>
  );
}

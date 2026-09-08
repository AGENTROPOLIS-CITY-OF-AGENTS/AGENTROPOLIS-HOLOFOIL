import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { CAMPUS_AGENTS, type WorkAgentSpec } from "@/lib/holofoil/agents";

type Home = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
};

function doorOf(home: Home): [number, number] {
  const [x, , z] = home.position;
  const len = Math.hypot(x, z) || 1;
  const inset = home.size[0] * 0.55 + 0.7;
  if (len < 0.4) return [1.8, 0];
  return [x - (x / len) * inset, z - (z / len) * inset];
}

function ringPoint(angle: number, radius: number): [number, number] {
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function buildPath(agent: WorkAgentSpec, homes: Home[]): [number, number][] {
  const home = homes.find((h) => h.id === agent.home) ?? homes[0];
  const door = doorOf(home);
  const a0 = Math.atan2(door[1], door[0]);
  const pts: [number, number][] = [];
  const radius = 8.9;
  for (let i = 0; i < 6; i += 1) {
    pts.push(ringPoint(a0 + (i / 6) * Math.PI * 1.4 + agent.phase * Math.PI * 2, radius));
  }
  pts.push(door);
  pts.push(ringPoint(a0 + 0.4, radius * 0.92));
  return pts;
}

export function WorkAgents({
  homes,
  reduced,
  roster = CAMPUS_AGENTS,
}: {
  homes: Home[];
  reduced: boolean;
  roster?: WorkAgentSpec[];
}) {
  return (
    <group>
      {roster.map((agent) => (
        <AgentMesh key={agent.id} agent={agent} homes={homes} reduced={reduced} />
      ))}
    </group>
  );
}

function AgentMesh({
  agent,
  homes,
  reduced,
}: {
  agent: WorkAgentSpec;
  homes: Home[];
  reduced: boolean;
}) {
  const group = useRef<Group>(null);
  const path = useMemo(() => buildPath(agent, homes), [agent, homes]);
  const lengths = useMemo(() => {
    const segs: number[] = [];
    let total = 0;
    for (let i = 0; i < path.length; i += 1) {
      const a = path[i];
      const b = path[(i + 1) % path.length];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      segs.push(L);
      total += L;
    }
    return { segs, total };
  }, [path]);
  const cursor = useRef({
    u: agent.phase,
    work: 0,
    mode: "walk" as "walk" | "work",
    armed: true,
  });

  useFrame((_, dt) => {
    const node = group.current;
    if (!node) return;
    const d = Math.min(dt, 0.1);
    if (reduced) {
      const [x, z] = path[0];
      node.position.set(x, 0, z);
      return;
    }
    const st = cursor.current;
    if (st.mode === "work") {
      st.work += d;
      node.position.y = 0.04 + Math.sin(st.work * 8) * 0.03;
      if (st.work > 1.8) {
        st.mode = "walk";
        st.work = 0;
        st.armed = false;
      }
      return;
    }
    st.u = (st.u + (agent.speed * d) / Math.max(lengths.total, 0.01)) % 1;
    let dist = st.u * lengths.total;
    let i = 0;
    while (i < lengths.segs.length && dist > lengths.segs[i]) {
      dist -= lengths.segs[i];
      i += 1;
    }
    const a = path[i % path.length];
    const b = path[(i + 1) % path.length];
    const seg = lengths.segs[i % lengths.segs.length] || 1;
    const t = dist / seg;
    const x = a[0] + (b[0] - a[0]) * t;
    const z = a[1] + (b[1] - a[1]) * t;
    node.position.set(x, 0, z);
    node.lookAt(b[0], 0, b[1]);
    if (i === path.length - 2 && t > 0.72 && st.armed) {
      st.mode = "work";
    } else if (i !== path.length - 2) {
      st.armed = true;
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.2, 0.36, 0.14]} />
        <meshBasicMaterial color={agent.color} />
      </mesh>
      <mesh position={[0, 0.64, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color={agent.color} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.16, 0.26, 0.12]} />
        <meshBasicMaterial color="#1a1c22" />
      </mesh>
      <mesh position={[0.12, 0.4, 0.02]} rotation={[0.2, 0, 0.4]}>
        <boxGeometry args={[0.08, 0.08, 0.12]} />
        <meshBasicMaterial color="#e8eef2" />
      </mesh>
    </group>
  );
}

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/holofoil/motion";
import type { HolofoilMediaSurfaceEngine } from "../core/engine.ts";
import { createManagedVideo } from "../loaders/video.ts";
import { commandFromPointer } from "../interactions/dispatch.ts";

export function HolofoilR3FSurface({
  surfaceId,
  engine,
}: {
  surfaceId: string;
  engine: HolofoilMediaSurfaceEngine;
}) {
  const resolved = engine.resolve(surfaceId);
  const theme = engine.themeFor(resolved.surface);
  const surface = resolved.surface;
  const media = resolved.media;
  const group = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [failed, setFailed] = useState(false);
  const posterTex = useMemo(() => {
    if (!media?.poster || typeof document === "undefined") return null;
    const loader = new THREE.TextureLoader();
    return loader.load(media.poster);
  }, [media?.poster]);

  useEffect(() => {
    if (!media || media.mediaType === "image" || prefersReducedMotion()) return;
    const managed = createManagedVideo(media, engine.hls?.attach);
    if (!managed) return;
    const videoTex = new THREE.VideoTexture(managed.el);
    videoTex.colorSpace = THREE.SRGBColorSpace;
    setTexture(videoTex);
    let alive = true;
    const tick = async () => {
      if (!alive) return;
      if (!engine.canPlay(surfaceId)) {
        managed.pause();
        return;
      }
      managed.setMuted(!engine.canHear(surfaceId));
      const result = await managed.play();
      if (result === "rejected") {
        setFailed(true);
        engine.report("playback_failed", { surfaceId });
        engine.report("fallback_displayed", { surfaceId });
      } else {
        engine.report("media_started", { surfaceId });
      }
    };
    void tick();
    return () => {
      alive = false;
      managed.dispose();
      videoTex.dispose();
      setTexture(null);
    };
  }, [engine, media, surfaceId]);

  useFrame(({ camera }, delta) => {
    engine.updateContext({
      camera: [camera.position.x, camera.position.y, camera.position.z],
      pageVisible: typeof document === "undefined" ? true : document.visibilityState === "visible",
      reducedMotion: prefersReducedMotion(),
      frameMs: delta * 1000,
      nowMs: Date.now(),
      visibleSurfaceIds: [...engine.surfaces.keys()],
    });
  });

  const pos = surface.position ?? [0, 2, 0];
  const rot = surface.rotation ?? [0, 0, 0];
  const scale = surface.scale ?? [2.4, 1.35, 1];
  const map = failed || prefersReducedMotion() || !engine.canPlay(surfaceId) ? posterTex : texture ?? posterTex;
  const aspect = media?.aspectRatio ?? scale[0] / scale[1];
  const width = scale[0];
  const height = width / aspect;

  const openCinema = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    const command = commandFromPointer(surface.interactionMode, media?.destinationUrl);
    if (command.type === "none") return;
    if (command.type === "open_destination" && command.url.startsWith("https://")) {
      window.open(command.url, "_blank", "noopener,noreferrer");
      return;
    }
    engine.openCinema(surfaceId);
  };

  return (
    <group ref={group} position={pos} rotation={rot}>
      <mesh position={[0, -height / 2 - 0.18, 0]}>
        <boxGeometry args={[0.12, 0.36, 0.12]} />
        <meshStandardMaterial color={theme.supportColor} metalness={0.4} roughness={0.55} />
      </mesh>
      <mesh>
        <boxGeometry args={[width + theme.borderWidth * 2, height + theme.borderWidth * 2, 0.08]} />
        <meshStandardMaterial
          color={theme.frameColor}
          emissive={theme.emissiveColor}
          emissiveIntensity={theme.glowStrength}
          metalness={theme.frameMaterial === "metal" ? 0.6 : 0.1}
          roughness={0.35}
        />
      </mesh>
      <mesh
        position={[0, 0, 0.05]}
        onClick={openCinema}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <planeGeometry args={[width, height]} />
        {map ? (
          <meshBasicMaterial map={map} toneMapped={false} />
        ) : (
          <meshBasicMaterial color={theme.loadingColor} />
        )}
      </mesh>
    </group>
  );
}

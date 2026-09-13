import { useEffect, useMemo } from "react";
import { HolofoilDomSurface, getHolofoilMediaEngine } from "@/lib/holofoil/media-surfaces";
import { ensureCampusMediaSurfaces } from "@/data/media-surfaces/campus";

export function CampusHero() {
  const engine = useMemo(() => getHolofoilMediaEngine(), []);
  useEffect(() => {
    ensureCampusMediaSurfaces(engine);
    engine.updateContext({
      pageVisible: true,
      visibleSurfaceIds: ["surface-001"],
      nowMs: Date.now(),
    });
  }, [engine]);

  return (
    <HolofoilDomSurface
      surfaceId="surface-001"
      engine={engine}
      className="relative overflow-hidden bg-bg"
    />
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { HolofoilCampus } from "@/components/holofoil/HolofoilCampus";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="h-[calc(100svh-var(--hf-header))] min-h-0 overflow-hidden">
      <HolofoilCampus />
    </main>
  );
}

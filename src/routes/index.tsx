import { createFileRoute } from "@tanstack/react-router";
import { HolofoilCampus } from "@/components/holofoil/HolofoilCampus";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="h-[calc(100dvh-8.25rem)] min-h-[540px]">
      <HolofoilCampus />
    </main>
  );
}

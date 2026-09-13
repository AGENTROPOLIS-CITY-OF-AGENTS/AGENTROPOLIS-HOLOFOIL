import { createFileRoute } from "@tanstack/react-router";
import { MotionLanding } from "@/components/landing/MotionLanding";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <MotionLanding />;
}

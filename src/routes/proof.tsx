import { createFileRoute } from "@tanstack/react-router";
import { AccessDenied } from "@/components/access/AccessDenied";

export const Route = createFileRoute("/proof")({ component: PublicProofDenied });

function PublicProofDenied() {
  return <AccessDenied />;
}

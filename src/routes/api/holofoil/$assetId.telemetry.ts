import { createFileRoute } from "@tanstack/react-router";
import {
  updateTelemetry,
  type HolofoilNode,
  type HolofoilTelemetry,
} from "@/lib/holofoil/registry";

export const Route = createFileRoute("/api/holofoil/$assetId/telemetry")({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        const body = (await request.json()) as {
          refractionTelemetry?: Partial<HolofoilTelemetry>;
          status?: HolofoilNode["status"];
        };
        const node = updateTelemetry(
          params.assetId,
          body.refractionTelemetry ?? {},
          body.status,
        );
        if (!node) {
          return Response.json(
            {
              success: false,
              error: "Holofoil node not found.",
            },
            { status: 404 },
          );
        }
        return Response.json({ success: true, data: node });
      },
    },
  },
});

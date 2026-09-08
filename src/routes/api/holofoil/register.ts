import { createFileRoute } from "@tanstack/react-router";
import { registerHoloNode, type HolofoilNodeInput } from "@/lib/holofoil/registry";

export const Route = createFileRoute("/api/holofoil/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Partial<HolofoilNodeInput>;
        if (
          !body.assetId ||
          !body.ownerId ||
          !body.coordinateVector ||
          !body.metadataPayload
        ) {
          return Response.json(
            {
              success: false,
              error: "Missing required registration fields.",
            },
            { status: 400 },
          );
        }
        const node = registerHoloNode(body as HolofoilNodeInput);
        return Response.json({ success: true, data: node }, { status: 201 });
      },
    },
  },
});

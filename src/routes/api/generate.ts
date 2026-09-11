import { createFileRoute } from "@tanstack/react-router";
import { generateProceduralSprite } from "@/lib/holofoil/procedural";
import type { SpriteStyle } from "@/lib/holofoil/types";

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          prompt?: string;
          style?: SpriteStyle;
          pixelSize?: number;
        };
        if (!body.prompt) {
          return Response.json({ error: "No prompt specified." }, { status: 400 });
        }
        const sprite = generateProceduralSprite(
          body.prompt,
          body.style || "retro-classic",
          body.pixelSize || 16,
        );
        return Response.json({
          status: "success",
          sprite,
          fallbacksTriggered: ["offline_procedural_engine"],
        });
      },
    },
  },
});

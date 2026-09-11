import { createFileRoute } from "@tanstack/react-router";
import { composeStoryboard } from "@/lib/holofoil/storyboard";

export const Route = createFileRoute("/api/storyboard")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          storyPrompt?: string;
          stylePreset?: string;
          cameraPreset?: string;
          lightingPreset?: string;
        };
        const storyboard = composeStoryboard({
          storyPrompt: body.storyPrompt || "A foil specimen under museum light",
          stylePreset: body.stylePreset || "Cinematic still",
          cameraPreset: body.cameraPreset || "Cinematic Wide-Shot",
          lightingPreset: body.lightingPreset || "Cyan key",
        });
        return Response.json({ status: "success", storyboard });
      },
    },
  },
});

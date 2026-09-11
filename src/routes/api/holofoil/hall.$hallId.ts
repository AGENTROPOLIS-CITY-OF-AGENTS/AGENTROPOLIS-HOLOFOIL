import { createFileRoute } from "@tanstack/react-router";
import { listHallNodes } from "@/lib/holofoil/registry";

export const Route = createFileRoute("/api/holofoil/hall/$hallId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const data = listHallNodes(params.hallId);
        return Response.json({ success: true, count: data.length, data });
      },
    },
  },
});

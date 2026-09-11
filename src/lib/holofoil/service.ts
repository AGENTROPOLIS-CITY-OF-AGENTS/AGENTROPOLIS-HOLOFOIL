import type { HolofoilNode, HolofoilNodeInput, HolofoilTelemetry } from "./registry";

const API_BASE = "/api/holofoil";

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export const HolofoilService = {
  async registerHoloNode(
    payload: HolofoilNodeInput,
  ): Promise<{ success: boolean; data?: HolofoilNode; error?: string }> {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  },

  async fetchHallNodes(
    hallId: string,
  ): Promise<{
    success: boolean;
    count: number;
    data: HolofoilNode[];
    error?: string;
  }> {
    const response = await fetch(`${API_BASE}/hall/${hallId}`);
    return parseJson(response);
  },

  async updateRefraction(
    assetId: string,
    telemetry: Partial<HolofoilTelemetry>,
  ): Promise<{ success: boolean; data?: HolofoilNode; error?: string }> {
    const response = await fetch(`${API_BASE}/${assetId}/telemetry`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refractionTelemetry: telemetry }),
    });
    return parseJson(response);
  },
};

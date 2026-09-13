import type { HolofoilTelemetryAdapter, HolofoilTelemetryEvent } from "../schemas/types.ts";

export function createTelemetry(adapter?: HolofoilTelemetryAdapter) {
  return {
    emit(event: HolofoilTelemetryEvent, payload: Record<string, string | number | boolean>) {
      adapter?.emit(event, payload);
    },
  };
}

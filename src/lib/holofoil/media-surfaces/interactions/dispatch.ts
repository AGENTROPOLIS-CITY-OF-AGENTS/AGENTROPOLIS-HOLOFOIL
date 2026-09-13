import type { HolofoilInteractionMode } from "../schemas/types.ts";

export type InteractionCommand =
  | { type: "authorize_audio" }
  | { type: "toggle_mute" }
  | { type: "expand" }
  | { type: "close" }
  | { type: "play_pause" }
  | { type: "open_destination"; url: string }
  | { type: "none" };

/**
 * Destinations are never inferred from filenames.
 * A portal/open command only fires when an explicit URL is provided.
 */
export function commandFromKey(
  key: string,
  mode: HolofoilInteractionMode = "none",
  destinationUrl?: string,
): InteractionCommand {
  if (key === "Escape") return { type: "close" };
  if (key === "m" || key === "M") return { type: "toggle_mute" };
  if (key === " " || key === "Enter") {
    if (mode === "expand") return { type: "expand" };
    if (mode === "portal") {
      if (!destinationUrl) return { type: "none" };
      return { type: "open_destination", url: destinationUrl };
    }
    return { type: "authorize_audio" };
  }
  if (key === "p" || key === "P") return { type: "play_pause" };
  return { type: "none" };
}

export function commandFromFilename(_name: string): InteractionCommand {
  return { type: "none" };
}

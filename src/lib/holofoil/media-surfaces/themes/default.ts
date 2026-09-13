import type { HolofoilMediaTheme } from "../schemas/types.ts";

/** Neutral default. Consuming apps override via registerHolofoilTheme. */
export const DEFAULT_MEDIA_THEME: HolofoilMediaTheme = {
  id: "theme-default",
  frameColor: "#16181d",
  frameMaterial: "metal",
  emissiveColor: "#7fd0c8",
  glowStrength: 0.22,
  screenBrightness: 0.92,
  borderWidth: 0.06,
  supportColor: "#0e1014",
  loadingColor: "#2a2e36",
  errorColor: "#3a3333",
  focusColor: "#d7efe9",
  typeColor: "#e8eef2",
};

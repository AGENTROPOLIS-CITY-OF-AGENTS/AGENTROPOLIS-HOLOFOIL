export const NAV_ITEMS = [
  { to: "/builder", label: "Build My Drop", hint: "Create" },
  { to: "/", label: "Campus", hint: "3D" },
  { to: "/lab", label: "Material Lab", hint: "Foil" },
  { to: "/studio", label: "Card Studio", hint: "Author" },
  { to: "/dex", label: "Creature-Dex", hint: "Specimens" },
  { to: "/stage", label: "3D Stage", hint: "Pavilions" },
  { to: "/storyboard", label: "Storyboard", hint: "Beats" },
  { to: "/sdk", label: "SDK / Integration", hint: "Contracts" },
] as const;

export type NavPath = (typeof NAV_ITEMS)[number]["to"];

export function isNavPath(path: string): path is NavPath {
  return NAV_ITEMS.some((item) => item.to === path);
}

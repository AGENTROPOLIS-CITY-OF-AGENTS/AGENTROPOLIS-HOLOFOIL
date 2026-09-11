export const NAV_ITEMS = [
  { to: "/intake", label: "New Project", hint: "Start" },
  { to: "/project", label: "Workspace", hint: "Ready" },
  { to: "/services", label: "Services", hint: "NEURO" },
  { to: "/builder", label: "Build My Drop", hint: "Create" },
  { to: "/drop", label: "Drop", hint: "Launch" },
  { to: "/embed/mint", label: "Test Mint", hint: "Testnet" },
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

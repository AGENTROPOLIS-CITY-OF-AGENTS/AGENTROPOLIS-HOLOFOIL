export type AgentJob = "inspect" | "route" | "catalog" | "press" | "stage";

export interface WorkAgentSpec {
  id: string;
  color: string;
  job: AgentJob;
  home: string;
  speed: number;
  phase: number;
}

export const AGENT_JOB_LABEL: Record<AgentJob, string> = {
  inspect: "inspecting foil",
  route: "routing a config",
  catalog: "cataloging a specimen",
  press: "pressing a card",
  stage: "rigging a pavilion",
};

export const CAMPUS_AGENTS: WorkAgentSpec[] = [
  { id: "a01", color: "#3ee0ff", job: "inspect", home: "lab", speed: 1.35, phase: 0.02 },
  { id: "a02", color: "#c4454a", job: "press", home: "studio", speed: 1.1, phase: 0.12 },
  { id: "a03", color: "#b6f25c", job: "stage", home: "stage", speed: 1.25, phase: 0.21 },
  { id: "a04", color: "#8b7cff", job: "catalog", home: "dex", speed: 1.05, phase: 0.33 },
  { id: "a05", color: "#ff7ad9", job: "route", home: "sdk", speed: 1.4, phase: 0.41 },
  { id: "a06", color: "#ffb347", job: "inspect", home: "lab", speed: 0.95, phase: 0.5 },
  { id: "a07", color: "#3ee0ff", job: "press", home: "studio", speed: 1.2, phase: 0.58 },
  { id: "a08", color: "#b6f25c", job: "stage", home: "story", speed: 1.15, phase: 0.67 },
  { id: "a09", color: "#c4454a", job: "catalog", home: "dex", speed: 1.3, phase: 0.74 },
  { id: "a10", color: "#8b7cff", job: "route", home: "core", speed: 1.08, phase: 0.82 },
  { id: "a11", color: "#3ee0ff", job: "inspect", home: "lab", speed: 1.22, phase: 0.9 },
  { id: "a12", color: "#ff7ad9", job: "press", home: "studio", speed: 1.18, phase: 0.96 },
  { id: "a13", color: "#b6f25c", job: "stage", home: "stage", speed: 1.0, phase: 0.08 },
  { id: "a14", color: "#ffb347", job: "route", home: "sdk", speed: 1.32, phase: 0.28 },
];

export const STAGE_AGENTS: WorkAgentSpec[] = [
  { id: "s01", color: "#3ee0ff", job: "stage", home: "hiphop", speed: 1.2, phase: 0.05 },
  { id: "s02", color: "#b6f25c", job: "stage", home: "videogames", speed: 1.1, phase: 0.18 },
  { id: "s03", color: "#8b7cff", job: "press", home: "tcg-fantasy", speed: 1.3, phase: 0.3 },
  { id: "s04", color: "#ff7ad9", job: "catalog", home: "anime-oasis", speed: 1.05, phase: 0.44 },
  { id: "s05", color: "#c4454a", job: "inspect", home: "genx-lounge", speed: 1.15, phase: 0.58 },
  { id: "s06", color: "#3ee0ff", job: "route", home: "serialized", speed: 1.25, phase: 0.7 },
  { id: "s07", color: "#ffb347", job: "stage", home: "vapor", speed: 0.98, phase: 0.82 },
  { id: "s08", color: "#b6f25c", job: "inspect", home: "obsidian", speed: 1.22, phase: 0.93 },
];

import type { HolofoilServiceId } from "../../contracts/service-enrollment.v1.ts";
import type {
  FileInventoryItemV1,
  FounderLaunchPackageV1,
  IntakePath,
  ProjectFactV1,
  TimelineEventV1,
} from "../../contracts/founder-intake.v1.ts";
import { assemblePackage } from "./package.ts";

export interface FounderProjectV1 {
  version: "1.0.0";
  projectId: string;
  workspaceId: string;
  name: string;
  path: IntakePath;
  facts: ProjectFactV1[];
  inventory: FileInventoryItemV1[];
  events: TimelineEventV1[];
  services: HolofoilServiceId[];
  launchPackage: FounderLaunchPackageV1;
  holofoilOwnsIp: false;
  ipOwnerLabel: string;
}

const KEY = "holofoil.founder-project.v1";

export function emptyProject(path: IntakePath, name = "Untitled project"): FounderProjectV1 {
  const projectId = "project-draft";
  return {
    version: "1.0.0",
    projectId,
    workspaceId: "workspace-draft",
    name,
    path,
    facts: [],
    inventory: [],
    events: [],
    services: ["DROP_CREATION"],
    launchPackage: assemblePackage(projectId, []),
    holofoilOwnsIp: false,
    ipOwnerLabel: "UNDECIDED",
  };
}

export function persistProject(project: FounderProjectV1): FounderProjectV1 {
  const next = { ...project, launchPackage: assemblePackage(project.projectId, project.facts) };
  if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function loadProject(): FounderProjectV1 | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FounderProjectV1;
  } catch {
    return null;
  }
}

export function mergeFacts(project: FounderProjectV1, incoming: ProjectFactV1[]): FounderProjectV1 {
  const map = new Map(project.facts.map((f) => [f.id, f]));
  for (const fact of incoming) map.set(fact.id, fact);
  const facts = [...map.values()];
  const ip = facts.find((f) => f.key === "ipOwner" && f.status === "VERIFIED");
  return persistProject({
    ...project,
    facts,
    ipOwnerLabel: ip?.value ?? project.ipOwnerLabel,
    holofoilOwnsIp: false,
  });
}

export function recordEvent(project: FounderProjectV1, event: Omit<TimelineEventV1, "id" | "at">): FounderProjectV1 {
  const next: TimelineEventV1 = {
    ...event,
    id: `evt-${project.events.length + 1}`,
    at: new Date().toISOString(),
  };
  return persistProject({ ...project, events: [...project.events, next] });
}

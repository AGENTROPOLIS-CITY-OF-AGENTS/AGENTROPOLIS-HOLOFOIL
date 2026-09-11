import type { LaunchPlan, LaunchRecipeId } from "../lib/creator-cloud/launch.ts";

export type AgentLaunchAction =
  | "INSPECT"
  | "APPLY_RECIPE"
  | "UPDATE_PHASE"
  | "SIMULATE"
  | "VALIDATE"
  | "PREPARE_PUBLISH"
  | "REQUEST_PUBLISH";

export interface AgentLaunchOperatorRequestV1 {
  version: "1.0.0";
  requestId: string;
  projectId: string;
  operator: {
    type: "AGENT";
    id: string;
  };
  action: AgentLaunchAction;
  recipe?: LaunchRecipeId;
  launch?: LaunchPlan;
  instruction?: string;
  executionEnvelopeRef?: string;
}

export interface AgentLaunchOperatorResultV1 {
  version: "1.0.0";
  requestId: string;
  projectId: string;
  status: "PREPARED" | "VALIDATED" | "SIMULATED" | "BLOCKED" | "APPROVAL_REQUIRED";
  launch?: LaunchPlan;
  blockers: string[];
  warnings: string[];
  receiptRef?: string;
}

export const FINANCIAL_ACTIONS: readonly AgentLaunchAction[] = ["REQUEST_PUBLISH"];

export function requiresExecutionAuthority(action: AgentLaunchAction): boolean {
  return FINANCIAL_ACTIONS.includes(action);
}

export function assertAgentLaunchAuthority(request: AgentLaunchOperatorRequestV1): void {
  if (requiresExecutionAuthority(request.action) && !request.executionEnvelopeRef) {
    throw new Error(
      "Live publish requests require an Execution Envelope reference. Agents may prepare and simulate without executing.",
    );
  }
}

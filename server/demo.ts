import { z } from "zod";

export const demoRoles = ["sponsor", "contributor", "reviewer", "public_verifier"] as const;
export type DemoRole = (typeof demoRoles)[number];

export interface DemoUser {
  id: string;
  displayName: string;
  role: DemoRole;
  walletAddress: string;
  organizationSlug?: string;
}

export const demoUsers: Record<DemoRole, DemoUser> = {
  sponsor: { id: "demo-sponsor", displayName: "Alex Rivera", role: "sponsor", walletAddress: "7pT9…K3xL", organizationSlug: "proofmesh-labs" },
  contributor: { id: "demo-contributor", displayName: "Maya Chen", role: "contributor", walletAddress: "7pT9…K3xL", organizationSlug: "proofmesh-labs" },
  reviewer: { id: "demo-reviewer", displayName: "Avery Rivera", role: "reviewer", walletAddress: "6aQ1…mR04", organizationSlug: "proofmesh-labs" },
  public_verifier: { id: "demo-public-verifier", displayName: "Public verifier", role: "public_verifier", walletAddress: "", organizationSlug: undefined },
};

export const demoRoleSchema = z.enum(demoRoles);

export function getDemoUser(request: { header(name: string): string | undefined }): DemoUser {
  const headerRole = request.header("x-demo-role");
  const parsed = demoRoleSchema.safeParse(headerRole ?? "sponsor");
  return demoUsers[parsed.success ? parsed.data : "sponsor"];
}

export function can(user: DemoUser, action: "create_task" | "edit_task" | "fund_task" | "submit_evidence" | "review_submission" | "view_private") {
  if (user.role === "public_verifier") return false;
  if (action === "create_task" || action === "edit_task" || action === "fund_task") return user.role === "sponsor";
  if (action === "submit_evidence") return user.role === "contributor";
  if (action === "review_submission") return user.role === "reviewer" || user.role === "sponsor";
  if (action === "view_private") return true;
  return false;
}

export function assertCan(user: DemoUser, action: Parameters<typeof can>[1]) {
  if (!can(user, action)) {
    const error = new Error(`Role ${user.role} cannot perform ${action}`);
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
}

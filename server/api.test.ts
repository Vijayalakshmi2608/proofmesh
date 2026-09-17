import { beforeAll, describe, expect, it } from "vitest";
import { getDemoUser } from "./demo";
import { prisma } from "./db";
import { dashboardMetrics } from "./services/dashboardService";
import { getProof, listProofs } from "./services/proofService";
import { createSubmission, reviewSubmission } from "./services/submissionService";
import { createTask, getTask, listTasks, updateTask } from "./services/taskService";
import { generateRecipe, validateRecipe } from "./services/recipeService";
import { runDeterministicChecks } from "./services/verificationService";
import { releasePayout, submitEvidence } from "./services/workflowService";
import { checkEligibility, listUnlockedTasks } from "./services/accessService";
import { listAgentPolicies, requestAgentTask } from "./services/agentService";
import { realMetrics } from "./services/metricsService";

const requestFor = (role: string) => ({ header: () => role }) as never;
const user = (role: string) => getDemoUser(requestFor(role));

beforeAll(async () => {
  expect((await prisma.organization.findUnique({ where: { slug: "proofmesh-labs" } }))?.name).toBe("ProofMesh Labs");
});

describe("ProofMesh Demo Mode API services", () => {
  it("allows sponsor task creation and rejects contributor task creation", async () => {
    await expect(createTask(user("sponsor"), { title: "Create a durable API contract", summary: "Define and document a stable API contract for the settlement service.", project: "ProofMesh API", paymentAmount: 50000 })).resolves.toMatchObject({ title: "Create a durable API contract" });
    await expect(createTask(user("contributor"), { title: "Contributor cannot create this task", summary: "This should fail because contributors do not own task creation.", project: "ProofMesh API", paymentAmount: 50000 })).rejects.toMatchObject({ status: 403 });
  });
  it("rejects a duplicate contributor submission", async () => {
    await expect(createSubmission(user("contributor"), { taskId: "task-001", note: "A second submission should be rejected by ownership rules." })).rejects.toMatchObject({ status: 409 });
  });
  it("enforces reviewer approval permissions", async () => {
    await expect(reviewSubmission(user("contributor"), "sub-001", { status: "approved" })).rejects.toMatchObject({ status: 403 });
    await expect(reviewSubmission(user("reviewer"), "sub-001", { status: "changes_requested", comment: "Please add the runbook evidence." })).resolves.toMatchObject({ id: "sub-001" });
  });
  it("only exposes public receipts to public verifiers", async () => {
    await expect(listProofs(user("public_verifier"))).resolves.toHaveLength(5);
    await expect(getProof(user("public_verifier"), "proof-001")).resolves.toMatchObject({ status: "active" });
  });
  it("denies private task access outside an organization and validates task input", async () => {
    await expect(listTasks(user("public_verifier"))).resolves.toHaveLength(0);
    await expect(getTask(user("public_verifier"), "task-001")).rejects.toMatchObject({ status: 403 });
    await expect(createTask(user("sponsor"), { title: "short", summary: "bad", project: "", paymentAmount: -1 })).rejects.toBeInstanceOf(Error);
  });
  it("rejects invalid task status transitions", async () => {
    await expect(updateTask(user("sponsor"), "task-001", { status: "paid" })).rejects.toMatchObject({ status: 409 });
  });
  it("calculates dashboard metrics from SQLite records", async () => {
    await expect(dashboardMetrics(user("sponsor"))).resolves.toMatchObject({ activeTasks: expect.any(Number), pendingReviews: expect.any(Number), totalEscrowed: expect.any(Number), verifiedWork: expect.any(Number) });
  });
  it("rejects ambiguous recipes and generates a safe draft without approval authority", async () => {
    const result = validateRecipe({ deliverables: ["ship it"], acceptanceCriteria: [{ label: "Be fast", description: "Make it good soon", measurable: false }], requiredEvidence: [{ type: "document", label: "Explanation", required: true }], automatedChecks: [], humanChecks: [{ label: "Review", instruction: "Reviewer checks the outcome." }], disputeWindowHours: 72, failureBehavior: "request_changes", policyVersion: "1.0" });
    expect(result.valid).toBe(false);
    await expect(generateRecipe("Define a measurable task for a Solana indexer with pull request evidence and a human reviewer.")).resolves.toMatchObject({ modelName: expect.any(String), validation: expect.any(Object) });
  });
  it("runs deterministic checks and records a server-side verification result", async () => {
    await expect(runDeterministicChecks(user("reviewer"), "sub-001")).resolves.toMatchObject({ submissionId: "sub-001", checks: expect.any(Array), recipeHash: expect.any(String) });
  });
  it("prevents expired submissions and mismatched policy-hash payouts", async () => {
    await expect(submitEvidence(user("contributor"), "task-003", { pullRequestUrl: "https://github.com/drift-monitor/api/pull/118", explanation: "This late submission should be rejected because the contract deadline has passed and the seeded task is expired.", idempotencyKey: "expired-test-key", evidence: [{ type: "pull_request", title: "PR", detail: "Late PR", href: "https://github.com/drift-monitor/api/pull/118" }] })).rejects.toMatchObject({ status: 409 });
    await expect(releasePayout(user("reviewer"), "sub-002", { payoutSignature: "5wK2rP91simulatedsignature", recipientWallet: "7pT9K3xLsimulatedwallet", network: "devnet", tokenMint: "DevnetTestTokenMint111111111111111111111111111", amount: 950, recipeHash: "b".repeat(64) })).rejects.toMatchObject({ status: 409 });
    await expect(releasePayout(user("reviewer"), "sub-002", { payoutSignature: "5wK2rP91simulatedsignature", recipientWallet: "7pT9K3xLsimulatedwallet", network: "devnet", tokenMint: "DevnetTestTokenMint111111111111111111111111111", amount: 950, recipeHash: "c".repeat(64) })).rejects.toMatchObject({ status: 409 });
  });
  it("unlocks an advanced task only from an active qualifying proof", async () => {
    await expect(checkEligibility(user("contributor"), "task-002")).resolves.toMatchObject({ eligible: true, requirement: { requiredCategory: "reliability" }, satisfiedBy: expect.any(Array) });
    await expect(listUnlockedTasks(user("contributor"))).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ title: "Ship multi-sig transaction simulator", eligible: true })]));
    await expect(checkEligibility(user("public_verifier"), "task-002")).resolves.toMatchObject({ eligible: false });
  });
  it("enforces simulated agent allowlists and threshold approvals", async () => {
    const policies = await listAgentPolicies(user("sponsor"));
    const policy = policies[0];
    const task = await prisma.task.findFirstOrThrow({ where: { category: "reliability" } });
    const contributor = await prisma.profile.findUniqueOrThrow({ where: { stableId: "demo-contributor" } });
    await expect(requestAgentTask(user("sponsor"), { policyId: policy.id, taskId: task.id, recipientId: contributor.id, requestedAmount: 18000, rationale: "Request a small simulated task assignment for the allowlisted contributor." })).resolves.toMatchObject({ simulated: true, requiresHumanApproval: false });
    await expect(requestAgentTask(user("sponsor"), { policyId: policy.id, taskId: task.id, recipientId: contributor.id, requestedAmount: 30000, rationale: "Request a larger simulated assignment that crosses the human approval threshold." })).resolves.toMatchObject({ simulated: true, requiresHumanApproval: true, status: "awaiting_human_approval" });
  });
  it("reports real SQLite metrics instead of placeholder dashboard numbers", async () => {
    await expect(realMetrics(user("sponsor"))).resolves.toMatchObject({ source: "sqlite", activeTasks: expect.any(Number), verifiedProofs: expect.any(Number), totalDevnetSettlement: expect.any(Number), proofReuseCount: expect.any(Number) });
  });
});

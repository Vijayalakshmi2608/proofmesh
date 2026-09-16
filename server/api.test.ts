import { beforeAll, describe, expect, it } from "vitest";
import { getDemoUser } from "./demo";
import { prisma } from "./db";
import { dashboardMetrics } from "./services/dashboardService";
import { getProof, listProofs } from "./services/proofService";
import { createSubmission, reviewSubmission } from "./services/submissionService";
import { createTask, getTask, listTasks, updateTask } from "./services/taskService";

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
    await expect(listProofs(user("public_verifier"))).resolves.toHaveLength(1);
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
});

import type { DemoUser } from "../demo";
import { prisma } from "../db";
import { publicProofId, publicTaskId } from "./serializers";
import { checkEligibility } from "./accessService";

export type ReputationNode = { id: string; type: "contributor" | "work" | "proof" | "issuer" | "opportunity"; label: string; status?: string; metadata?: Record<string, string | number | boolean | null> };
export type ReputationEdge = { id: string; from: string; to: string; relation: "completed" | "verified_as" | "issued_by" | "unlocks" | "applied_to"; status: "active" | "revoked" | "expired" | "historical" };

async function organizationFor(user: DemoUser) {
  return user.organizationSlug ? prisma.organization.findUniqueOrThrow({ where: { slug: user.organizationSlug } }) : null;
}

async function contributorFor(user: DemoUser, requested?: string) {
  const stableId = requested ?? (user.role === "contributor" ? user.id : "demo-contributor");
  return prisma.profile.findUnique({ where: { stableId } });
}

export async function getReputationGraph(user: DemoUser, requestedContributor?: string) {
  const organization = await organizationFor(user);
  if (!organization) return { nodes: [], edges: [], generatedFrom: "sqlite", disclosure: "Only public proof metadata is included." };
  const contributor = await contributorFor(user, requestedContributor);
  if (!contributor) return { nodes: [], edges: [], generatedFrom: "sqlite", disclosure: "Contributor not found." };
  const [tasks, proofs, accessEvents] = await Promise.all([
    prisma.task.findMany({ where: { organizationId: organization.id }, orderBy: { createdAt: "asc" }, include: { sponsor: true, submissions: { where: { contributorId: contributor.id }, include: { proofReceipt: true } }, proofRequirement: true } }),
    prisma.proofReceipt.findMany({ where: { contributorId: contributor.id, publicVisibility: true, task: { organizationId: organization.id } }, orderBy: { issuedAt: "asc" }, include: { task: { include: { sponsor: true } }, accessEvents: true } }),
    prisma.proofAccessEvent.findMany({ where: { contributorId: contributor.id, task: { organizationId: organization.id } }, orderBy: { createdAt: "asc" }, include: { task: true, proofReceipt: true } }),
  ]);
  const proofIds = new Map(proofs.map((proof, index) => [proof.id, publicProofId(index)]));
  const taskIds = new Map(tasks.map((task, index) => [task.id, publicTaskId(index)]));
  const nodes: ReputationNode[] = [{ id: `contributor:${contributor.stableId}`, type: "contributor", label: contributor.displayName, metadata: { stableId: contributor.stableId } }];
  const edges: ReputationEdge[] = [];
  for (const task of tasks) {
    const submission = task.submissions[0];
    if (submission) {
      const workId = `work:${submission.id}`;
      nodes.push({ id: workId, type: "work", label: task.title, status: submission.status, metadata: { taskId: taskIds.get(task.id) ?? task.id, submittedAt: submission.submittedAt?.toISOString() ?? null } });
      edges.push({ id: `completed:${submission.id}`, from: `contributor:${contributor.stableId}`, to: workId, relation: "completed", status: submission.status === "rejected" ? "historical" : "active" });
      if (submission.proofReceipt) {
        const proofId = `proof:${proofIds.get(submission.proofReceipt.id) ?? submission.proofReceipt.id}`;
        edges.push({ id: `verified:${submission.id}`, from: workId, to: proofId, relation: "verified_as", status: submission.proofReceipt.status === "active" || submission.proofReceipt.status === "issued" ? "active" : submission.proofReceipt.status === "expired" ? "expired" : "revoked" });
      }
    }
  }
  for (const proof of proofs) {
    const proofId = `proof:${proofIds.get(proof.id)}`;
    const issuerId = `issuer:${proof.sponsorOrganization ?? proof.task.sponsor.stableId}`;
    nodes.push({ id: proofId, type: "proof", label: proof.task.title, status: proof.status, metadata: { publicId: proofIds.get(proof.id) ?? proof.id, commitment: proof.credentialCommitment ?? proof.verificationHash, network: proof.credentialNetwork, reuseCount: proof.accessEvents.length } });
    nodes.push({ id: issuerId, type: "issuer", label: proof.sponsorOrganization ?? proof.task.sponsor.displayName, metadata: { organization: proof.sponsorOrganization ?? proof.task.sponsor.stableId } });
    edges.push({ id: `issued:${proof.id}`, from: issuerId, to: proofId, relation: "issued_by", status: proof.status === "active" || proof.status === "issued" ? "active" : proof.status === "expired" ? "expired" : "revoked" });
  }
  for (const task of tasks.filter((item) => item.proofRequirement)) {
    const opportunityId = `opportunity:${taskIds.get(task.id) ?? task.id}`;
    nodes.push({ id: opportunityId, type: "opportunity", label: task.title, status: task.status, metadata: { publicId: taskIds.get(task.id) ?? task.id, reward: task.paymentAmount / 100 } });
    for (const event of accessEvents.filter((item) => item.taskId === task.id)) {
      const proofPublicId = proofIds.get(event.proofReceiptId);
      if (proofPublicId) edges.push({ id: `unlocks:${event.id}`, from: `proof:${proofPublicId}`, to: opportunityId, relation: event.eventType === "applied" ? "applied_to" : "unlocks", status: event.proofReceipt.status === "active" ? "active" : event.proofReceipt.status === "expired" ? "expired" : "revoked" });
    }
  }
  return { nodes, edges, generatedFrom: "sqlite", contributor: { stableId: contributor.stableId, displayName: contributor.displayName }, disclosure: "Graph relationships use persisted tasks, submissions, public receipt metadata, issuers, and access events. Private evidence is never included." };
}

export async function listOpportunities(user: DemoUser) {
  const organization = await organizationFor(user);
  if (!organization || user.role !== "contributor") return [];
  const contributor = await contributorFor(user);
  if (!contributor) return [];
  const [tasks, allTasks] = await Promise.all([
    prisma.task.findMany({ where: { organizationId: organization.id, status: { in: ["published", "funded", "in_progress"] } }, orderBy: { createdAt: "desc" }, include: { proofRequirement: true } }),
    prisma.task.findMany({ where: { organizationId: organization.id }, orderBy: { createdAt: "asc" }, select: { id: true } }),
  ]);
  const publicTaskIds = new Map(allTasks.map((task, index) => [task.id, publicTaskId(index)]));
  const proofs = await prisma.proofReceipt.findMany({ where: { contributorId: contributor.id, publicVisibility: true, task: { organizationId: organization.id } }, orderBy: { issuedAt: "desc" }, include: { task: true } });
  const result = [];
  for (let index = 0; index < tasks.length; index += 1) {
    const task = tasks[index];
    const taskId = publicTaskIds.get(task.id) ?? publicTaskId(index);
    const eligibility = await checkEligibility(user, task.id);
    const excluded = proofs.filter((proof) => proof.status === "revoked" || proof.status === "expired").map((proof) => ({ proofId: proof.id, status: proof.status, taskTitle: proof.task.title, reason: proof.status === "revoked" ? "Revoked credentials cannot unlock work." : "Expired credentials cannot unlock work." }));
    result.push({ taskId, title: task.title, category: task.category, chain: task.chain, reward: task.paymentAmount / 100, status: task.status, eligible: eligibility.eligible, matchStatus: eligibility.eligible ? "qualified" : task.proofRequirement ? "missing_proof" : "open", whyQualify: eligibility.eligible ? `Qualified by ${eligibility.satisfiedBy.map((proof) => proof.proofId).join(", ") || "an open opportunity rule"}.` : task.proofRequirement ? `Missing: ${(eligibility.unmetRequirements ?? []).join(", ") || "an active qualifying receipt"}.` : "No prior credential is required.", supportingProofs: eligibility.satisfiedBy, missingRequirements: eligibility.unmetRequirements ?? [], excludedCredentials: excluded, privacy: eligibility.disclosure });
  }
  return result;
}

export async function getReputationHistory(user: DemoUser) {
  const contributor = await contributorFor(user);
  if (!contributor) return { contributor: null, completedWork: [], activeCredentials: 0, revokedCredentials: 0, reuseCount: 0 };
  const proofs = await prisma.proofReceipt.findMany({ where: { contributorId: contributor.id }, orderBy: { issuedAt: "desc" }, include: { task: true, accessEvents: true, submission: true } });
  return { contributor: { stableId: contributor.stableId, displayName: contributor.displayName }, completedWork: proofs.map((proof) => ({ proofId: proof.id, taskTitle: proof.task.title, status: proof.status, reward: proof.rewardAmount / 100, issuedAt: proof.issuedAt.toISOString(), reuseCount: proof.accessEvents.length, commitment: proof.credentialCommitment ?? proof.verificationHash })), activeCredentials: proofs.filter((proof) => proof.status === "active" || proof.status === "issued").length, revokedCredentials: proofs.filter((proof) => proof.status === "revoked" || proof.status === "expired").length, reuseCount: proofs.reduce((sum, proof) => sum + proof.accessEvents.length, 0) };
}

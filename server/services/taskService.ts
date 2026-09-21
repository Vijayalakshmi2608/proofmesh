import { z } from "zod";
import { prisma } from "../db";
import type { DemoUser } from "../demo";
import { assertCan } from "../demo";
import { serializeTask, publicTaskId } from "./serializers";

const taskInput = z.object({ title: z.string().min(8), summary: z.string().min(20), project: z.string().min(2), paymentAmount: z.number().int().positive().max(10_000_000), deadline: z.string().datetime().optional(), maxSubmissions: z.number().int().min(1).max(10).default(2) });
const statusTransitions: Record<string, string[]> = { draft: ["published", "funded"], published: ["funded", "expired"], funded: ["in_progress", "expired"], in_progress: ["submitted", "expired"], submitted: ["awaiting_review"], awaiting_review: ["approved", "rejected", "disputed"], approved: ["paid"], rejected: ["in_progress"], disputed: ["approved", "rejected"], paid: [], expired: [] };

async function getOrganization(user: DemoUser) { return user.organizationSlug ? prisma.organization.findUniqueOrThrow({ where: { slug: user.organizationSlug } }) : null; }
async function findTask(user: DemoUser, id: string) {
  const org = await getOrganization(user);
  if (!org) throw Object.assign(new Error("Public users cannot access private tasks"), { status: 403 });
  const tasks = await prisma.task.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: "asc" }, include: { requirements: true, submissions: true, sponsor: true, proofRequirement: true } });
  const index = /^task-\d+$/.test(id) ? Number(id.replace("task-", "")) - 1 : -1;
  const task = index >= 0 ? tasks[index] : tasks.find((item) => item.id === id);
  if (!task) throw Object.assign(new Error("Task not found"), { status: 404 });
  return { task, index: index >= 0 ? index : tasks.findIndex((item) => item.id === task.id) };
}

export async function listTasks(user: DemoUser) {
  const org = await getOrganization(user);
  if (!org) return [];
  const rows = await prisma.task.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: "asc" }, include: { requirements: true, submissions: true, sponsor: true, proofRequirement: true } });
  return rows.map((task, index) => ({ ...serializeTask(task), id: publicTaskId(index) }));
}
export async function getTask(user: DemoUser, id: string) { const { task, index } = await findTask(user, id); return { ...serializeTask(task), id: publicTaskId(index) }; }
export async function createTask(user: DemoUser, input: unknown) {
  assertCan(user, "create_task");
  const data = taskInput.parse(input);
  const org = await getOrganization(user);
  if (!org) throw Object.assign(new Error("Organization not found"), { status: 404 });
  const sponsor = await prisma.profile.findUniqueOrThrow({ where: { stableId: user.id } });
  const task = await prisma.task.create({ data: { organizationId: org.id, sponsorId: sponsor.id, title: data.title, summary: data.summary, project: data.project, paymentAmount: data.paymentAmount, maxSubmissions: data.maxSubmissions, deadline: data.deadline ? new Date(data.deadline) : undefined, status: "draft", requirements: { create: [{ label: "Evidence satisfies the outcome", description: "Submitted evidence matches the agreed acceptance criteria.", position: 0 }] }, versions: { create: { version: 1, snapshot: data.summary, contentHash: `draft-${Date.now()}` } } }, include: { requirements: true, submissions: true, sponsor: true, proofRequirement: true } });
  return { ...serializeTask(task), id: task.id };
}
export async function updateTask(user: DemoUser, id: string, input: unknown) {
  assertCan(user, "edit_task");
  const { task, index } = await findTask(user, id);
  const patch = z.object({ title: z.string().min(8).optional(), summary: z.string().min(20).optional(), status: z.string().optional() }).parse(input);
  if (patch.status && patch.status !== task.status && !statusTransitions[task.status]?.includes(patch.status)) throw Object.assign(new Error(`Invalid status transition from ${task.status} to ${patch.status}`), { status: 409 });
  const updated = await prisma.task.update({ where: { id: task.id }, data: patch, include: { requirements: true, submissions: true, sponsor: true, proofRequirement: true } });
  return { ...serializeTask(updated), id: publicTaskId(index) };
}

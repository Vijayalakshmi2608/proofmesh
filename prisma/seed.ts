import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function main() {
  await prisma.activityEvent.deleteMany();
  await prisma.proofReceipt.deleteMany();
  await prisma.escrow.deleteMany();
  await prisma.review.deleteMany();
  await prisma.verificationRun.deleteMany();
  await prisma.evidenceItem.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.taskVersion.deleteMany();
  await prisma.taskVerificationRecipe.deleteMany();
  await prisma.taskRequirement.deleteMany();
  await prisma.task.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.profile.deleteMany();

  const sponsor = await prisma.profile.create({ data: { stableId: "demo-sponsor", displayName: "Alex Rivera", role: "sponsor", walletAddress: "7pT9…K3xL" } });
  const contributor = await prisma.profile.create({ data: { stableId: "demo-contributor", displayName: "Maya Chen", role: "contributor", walletAddress: "7pT9…K3xL" } });
  const reviewer = await prisma.profile.create({ data: { stableId: "demo-reviewer", displayName: "Avery Rivera", role: "reviewer", walletAddress: "6aQ1…mR04" } });
  const admin = await prisma.profile.create({ data: { stableId: "demo-admin", displayName: "ProofMesh Admin", role: "admin", walletAddress: "" } });
  const organization = await prisma.organization.create({ data: { name: "ProofMesh Labs", slug: "proofmesh-labs" } });
  await prisma.organizationMember.createMany({ data: [
    { organizationId: organization.id, profileId: sponsor.id, role: "sponsor" },
    { organizationId: organization.id, profileId: contributor.id, role: "contributor" },
    { organizationId: organization.id, profileId: reviewer.id, role: "reviewer" },
    { organizationId: organization.id, profileId: admin.id, role: "admin" },
  ] });

  const task1 = await prisma.task.create({ data: {
    organizationId: organization.id, sponsorId: sponsor.id, title: "Upgrade indexer to compressed account support", summary: "Add deterministic parsing and backfill support for compressed account updates in the event indexer.", project: "Helius Indexer", status: "awaiting_review", paymentAmount: 240000, maxSubmissions: 3, deadline: new Date("2026-09-18T18:00:00Z"), createdAt: daysAgo(7), requirements: { create: [
      { label: "Parse compressed account changes", description: "Decode account leaf updates from the Geyser stream without dropping sequence numbers.", passed: true, position: 0 },
      { label: "Backfill is idempotent", description: "Replaying a slot range produces the same indexed state on every run.", passed: true, position: 1 },
      { label: "P95 latency stays under 120ms", description: "Benchmark against the provided 50k account fixture on a clean runner.", passed: true, position: 2 },
      { label: "Add operational runbook", description: "Document replay, rollback, and monitoring steps for on-call engineers.", passed: false, position: 3 },
    ] }, recipes: { create: { name: "Indexer CI", command: "pnpm test && pnpm benchmark", recipeHash: "recipe_indexer_v1" } }, versions: { create: { version: 1, snapshot: "Initial acceptance criteria", contentHash: "sha256:indexer-v1" } }, escrow: { create: { status: "funded", paymentAmount: 240000, walletAddress: "6Lk2…A9qE", simulated: true } },
  } });
  const task2 = await prisma.task.create({ data: {
    organizationId: organization.id, sponsorId: sponsor.id, title: "Ship multi-sig transaction simulator", summary: "Build a safe simulation surface for wallet teams to inspect account diffs before signing.", project: "Squads Protocol", status: "in_progress", paymentAmount: 180000, maxSubmissions: 2, deadline: new Date("2026-09-24T18:00:00Z"), createdAt: daysAgo(5), requirements: { create: [
      { label: "Simulate SPL token transfers", description: "Render pre/post balances and account diffs for a token transfer batch.", position: 0 },
      { label: "Flag writable account drift", description: "Detect writable accounts not declared by the transaction intent.", position: 1 },
      { label: "Export a shareable report", description: "Generate a stable JSON report with a human-readable summary.", position: 2 },
    ] }, recipes: { create: { name: "Simulator checks", command: "pnpm test", recipeHash: "recipe_simulator_v1" } }, versions: { create: { version: 1, snapshot: "Initial acceptance criteria", contentHash: "sha256:simulator-v1" } }, escrow: { create: { status: "funded", paymentAmount: 180000, walletAddress: "5Fv2…J91K", simulated: true } },
  } });
  const task3 = await prisma.task.create({ data: {
    organizationId: organization.id, sponsorId: sponsor.id, title: "Add webhook replay protection", summary: "Prevent duplicate settlement events and give operators a replay-safe audit trail.", project: "Drift Monitor", status: "paid", paymentAmount: 95000, maxSubmissions: 2, deadline: new Date("2026-09-14T18:00:00Z"), createdAt: daysAgo(3), requirements: { create: [
      { label: "Deduplicate on event id", description: "Duplicate delivery never triggers a second settlement.", passed: true, position: 0 },
      { label: "Record replay provenance", description: "Store delivery attempt, actor, and decision in an append-only log.", passed: true, position: 1 },
      { label: "Add failure recovery test", description: "Cover retry and partial outage behavior with an integration test.", passed: true, position: 2 },
    ] }, recipes: { create: { name: "Webhook suite", command: "pnpm test:integration", recipeHash: "recipe_webhooks_v1" } }, versions: { create: { version: 1, snapshot: "Initial acceptance criteria", contentHash: "sha256:webhooks-v1" } }, escrow: { create: { status: "released", paymentAmount: 95000, walletAddress: "4Xa1…P110", transactionHash: "5wK2…rP91", simulated: true } },
  } });

  const submission1 = await prisma.submission.create({ data: {
    taskId: task1.id, contributorId: contributor.id, status: "awaiting_review", note: "Implemented the parser behind a feature flag and included replay fixtures from the 50k account benchmark. The runbook is drafted in the PR notes and ready for review.", submittedAt: new Date("2026-09-16T08:42:00Z"), evidence: { create: [
      { type: "repository", title: "github.com/helius/indexer/pull/842", detail: "+1,284 / −192 lines · 14 files changed", href: "https://github.com/helius/indexer/pull/842", contentHash: "sha256:pr842" },
      { type: "benchmark", title: "Benchmark run #1842", detail: "P95 96ms · 50,000 accounts · 3m 12s", href: "https://ci.helius.dev/runs/1842", contentHash: "sha256:bench1842" },
      { type: "document", title: "Operational runbook draft", detail: "Notion · Updated 18 minutes ago", href: "https://notion.so/proofmesh/runbook", isPrivate: true },
      { type: "preview", title: "Indexer staging preview", detail: "staging.helius.dev/indexer", href: "https://staging.helius.dev/indexer" },
    ] }, verificationRuns: { create: [
      { label: "Repository checks", value: "184 / 184 passed", status: "passed", recipeHash: "recipe_indexer_v1" },
      { label: "Benchmark threshold", value: "96ms / 120ms", status: "passed", recipeHash: "recipe_indexer_v1" },
      { label: "Human review", value: "Awaiting reviewer", status: "pending", recipeHash: "recipe_indexer_v1" },
    ] },
  } });
  const submission2 = await prisma.submission.create({ data: {
    taskId: task3.id, contributorId: contributor.id, status: "approved", note: "Replay keys are persisted with a 30-day retention window and surfaced in the operator audit view.", submittedAt: new Date("2026-09-13T15:26:00Z"), reviewedAt: new Date("2026-09-14T09:18:00Z"), evidence: { create: [
      { type: "repository", title: "github.com/drift-monitor/api/pull/118", detail: "+638 / −44 lines · 9 files changed", href: "https://github.com/drift-monitor/api/pull/118" },
      { type: "benchmark", title: "Integration suite #771", detail: "42 / 42 passed · 0 flaky tests", href: "https://ci.drift.monitor/runs/771" },
    ] }, verificationRuns: { create: [
      { label: "Repository checks", value: "42 / 42 passed", status: "passed", recipeHash: "recipe_webhooks_v1" },
      { label: "Human review", value: "Approved by Avery Rivera", status: "passed", recipeHash: "recipe_webhooks_v1" },
      { label: "Escrow settlement", value: "Released", status: "passed", recipeHash: "recipe_webhooks_v1" },
    ] }, reviews: { create: { reviewerId: reviewer.id, status: "approved", comment: "Verified all three criteria against the submitted evidence." } },
  } });

  await prisma.proofReceipt.createMany({ data: [
    { taskId: task3.id, submissionId: submission2.id, contributorId: contributor.id, rewardAmount: 95000, verificationHash: "pm_7f4c…d902", transactionHash: "5wK2…rP91", contentHash: "sha256:proof-webhooks", recipeHash: "recipe_webhooks_v1" },
  ] });
  await prisma.activityEvent.createMany({ data: [
    { organizationId: organization.id, actorId: contributor.id, taskId: task1.id, submissionId: submission1.id, kind: "review", title: "Maya Chen submitted evidence", detail: "Upgrade indexer to compressed account support", color: "violet", href: "/submissions/sub-001", createdAt: new Date("2026-09-16T08:42:00Z") },
    { organizationId: organization.id, actorId: reviewer.id, taskId: task3.id, submissionId: submission2.id, kind: "verified", title: "Automated checks passed", detail: "42 checks on Add webhook replay protection", color: "emerald", href: "/submissions/sub-002", createdAt: new Date("2026-09-16T07:00:00Z") },
    { organizationId: organization.id, actorId: reviewer.id, taskId: task3.id, submissionId: submission2.id, kind: "issued", title: "Proof receipt issued", detail: "Add webhook replay protection · 950 USDC", color: "blue", href: "/proofs/proof-001", createdAt: new Date("2026-09-16T06:55:00Z") },
    { organizationId: organization.id, actorId: sponsor.id, taskId: task2.id, kind: "funded", title: "Escrow funded", detail: "Multi-sig transaction simulator · 1,800 USDC", color: "amber", href: "/tasks/task-002", createdAt: daysAgo(1) },
    { organizationId: organization.id, actorId: sponsor.id, taskId: task2.id, kind: "submitted", title: "Task moved to active", detail: "Multi-sig transaction simulator", color: "violet", href: "/tasks/task-002", createdAt: daysAgo(1) },
  ] });

  console.log(`Seeded ${organization.name} with tasks ${task1.id}, ${task2.id}, ${task3.id}`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());

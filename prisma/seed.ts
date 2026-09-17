import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function main() {
  await prisma.activityEvent.deleteMany();
  await prisma.financialAudit.deleteMany();
  await prisma.agentRequest.deleteMany();
  await prisma.agentPolicy.deleteMany();
  await prisma.proofAccessEvent.deleteMany();
  await prisma.proofRequirement.deleteMany();
  await prisma.proofReceipt.deleteMany();
  await prisma.escrow.deleteMany();
  await prisma.review.deleteMany();
  await prisma.verificationRun.deleteMany();
  await prisma.evidenceItem.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.outcomeContract.deleteMany();
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
  const contributorTwo = await prisma.profile.create({ data: { stableId: "demo-contributor-2", displayName: "Jon Bell", role: "contributor", walletAddress: "8xQ2…pL8F" } });
  const contributorThree = await prisma.profile.create({ data: { stableId: "demo-contributor-3", displayName: "Priya Nair", role: "contributor", walletAddress: "6aQ1…mR04" } });
  const contributorFour = await prisma.profile.create({ data: { stableId: "demo-contributor-4", displayName: "Noah Williams", role: "contributor", walletAddress: "9mL4…eV17" } });
  const organization = await prisma.organization.create({ data: { name: "ProofMesh Labs", slug: "proofmesh-labs" } });
  await prisma.organizationMember.createMany({ data: [
    { organizationId: organization.id, profileId: sponsor.id, role: "sponsor" },
    { organizationId: organization.id, profileId: contributor.id, role: "contributor" },
    { organizationId: organization.id, profileId: reviewer.id, role: "reviewer" },
    { organizationId: organization.id, profileId: admin.id, role: "admin" },
    { organizationId: organization.id, profileId: contributorTwo.id, role: "contributor" },
    { organizationId: organization.id, profileId: contributorThree.id, role: "contributor" },
    { organizationId: organization.id, profileId: contributorFour.id, role: "contributor" },
  ] });

  const task1 = await prisma.task.create({ data: {
    organizationId: organization.id, sponsorId: sponsor.id, title: "Upgrade indexer to compressed account support", summary: "Add deterministic parsing and backfill support for compressed account updates in the event indexer.", project: "Helius Indexer", repositoryUrl: "https://github.com/helius/indexer", category: "indexing", status: "awaiting_review", paymentAmount: 240000, maxSubmissions: 3, deadline: new Date("2026-09-18T18:00:00Z"), createdAt: daysAgo(7), requirements: { create: [
      { label: "Parse compressed account changes", description: "Decode account leaf updates from the Geyser stream without dropping sequence numbers.", passed: true, position: 0 },
      { label: "Backfill is idempotent", description: "Replaying a slot range produces the same indexed state on every run.", passed: true, position: 1 },
      { label: "P95 latency stays under 120ms", description: "Benchmark against the provided 50k account fixture on a clean runner.", passed: true, position: 2 },
      { label: "Add operational runbook", description: "Document replay, rollback, and monitoring steps for on-call engineers.", passed: false, position: 3 },
    ] }, recipes: { create: { name: "Indexer CI", command: "pnpm test && pnpm benchmark", recipeHash: "recipe_indexer_v1" } }, versions: { create: { version: 1, snapshot: "Initial acceptance criteria", contentHash: "sha256:indexer-v1" } }, escrow: { create: { status: "funded", paymentAmount: 240000, walletAddress: "6Lk2…A9qE", simulated: true } },
  } });
  const task2 = await prisma.task.create({ data: {
    organizationId: organization.id, sponsorId: sponsor.id, title: "Ship multi-sig transaction simulator", summary: "Build a safe simulation surface for wallet teams to inspect account diffs before signing.", project: "Squads Protocol", repositoryUrl: "https://github.com/Squads-Protocol/squads", category: "wallets", status: "in_progress", paymentAmount: 180000, maxSubmissions: 2, deadline: new Date("2026-09-24T18:00:00Z"), createdAt: daysAgo(5), requirements: { create: [
      { label: "Simulate SPL token transfers", description: "Render pre/post balances and account diffs for a token transfer batch.", position: 0 },
      { label: "Flag writable account drift", description: "Detect writable accounts not declared by the transaction intent.", position: 1 },
      { label: "Export a shareable report", description: "Generate a stable JSON report with a human-readable summary.", position: 2 },
    ] }, recipes: { create: { name: "Simulator checks", command: "pnpm test", recipeHash: "recipe_simulator_v1" } }, versions: { create: { version: 1, snapshot: "Initial acceptance criteria", contentHash: "sha256:simulator-v1" } }, escrow: { create: { status: "funded", paymentAmount: 180000, walletAddress: "5Fv2…J91K", simulated: true } },
  } });
  const task3 = await prisma.task.create({ data: {
    organizationId: organization.id, sponsorId: sponsor.id, title: "Add webhook replay protection", summary: "Prevent duplicate settlement events and give operators a replay-safe audit trail.", project: "Drift Monitor", repositoryUrl: "https://github.com/drift-monitor/api", category: "reliability", status: "paid", paymentAmount: 95000, maxSubmissions: 2, deadline: new Date("2026-09-14T18:00:00Z"), createdAt: daysAgo(3), requirements: { create: [
      { label: "Deduplicate on event id", description: "Duplicate delivery never triggers a second settlement.", passed: true, position: 0 },
      { label: "Record replay provenance", description: "Store delivery attempt, actor, and decision in an append-only log.", passed: true, position: 1 },
      { label: "Add failure recovery test", description: "Cover retry and partial outage behavior with an integration test.", passed: true, position: 2 },
    ] }, recipes: { create: { name: "Webhook suite", command: "pnpm test:integration", recipeHash: "recipe_webhooks_v1" } }, versions: { create: { version: 1, snapshot: "Initial acceptance criteria", contentHash: "sha256:webhooks-v1" } }, escrow: { create: { status: "released", paymentAmount: 95000, walletAddress: "4Xa1…P110", transactionHash: "5wK2…rP91", simulated: true } },
  } });
  const task4 = await prisma.task.create({ data: {
    organizationId: organization.id, sponsorId: sponsor.id, title: "Advanced Solana Payment Integration", summary: "Implement a resilient payment flow with confirmed Devnet settlement, recoverable failures, and operator documentation.", project: "ProofMesh Payments", category: "development", status: "published", paymentAmount: 200, maxSubmissions: 3, deadline: new Date("2026-09-29T18:00:00Z"), createdAt: daysAgo(2), requirements: { create: [
      { label: "Payment flow implemented", description: "The payment flow handles the defined transfer path and account states.", position: 0 },
      { label: "Transaction confirmed", description: "The submitted transaction reaches a confirmed Devnet state.", position: 1 },
      { label: "Error handling included", description: "Failure and recovery states are visible to operators.", position: 2 },
      { label: "Documentation provided", description: "The integration and recovery path are documented for reviewers.", position: 3 },
    ] }, recipes: { create: { name: "Payment integration checks", command: "pnpm test:payments", recipeHash: "recipe_payments_v1" } }, versions: { create: { version: 1, snapshot: "Proof-gated advanced Solana payment task", contentHash: "sha256:payments-v1" } }, escrow: { create: { status: "funded", paymentAmount: 200, walletAddress: "DemoTreasury111", simulated: true } },
  } });
  const task5 = await prisma.task.create({ data: {
    organizationId: organization.id, sponsorId: sponsor.id, title: "Write Solana SDK migration guide", summary: "Document a safe SDK migration with runnable examples, compatibility notes, and a rollback checklist.", project: "Open Source Docs", category: "documentation", status: "published", paymentAmount: 125, maxSubmissions: 2, deadline: new Date("2026-10-02T18:00:00Z"), createdAt: daysAgo(1), requirements: { create: [
      { label: "Migration path is reproducible", description: "A fresh contributor can follow the guide from a clean checkout.", position: 0 },
      { label: "Compatibility notes included", description: "Breaking changes and supported versions are explicit.", position: 1 },
      { label: "Rollback checklist included", description: "The operator path for reverting the migration is documented.", position: 2 },
    ] }, recipes: { create: { name: "Documentation checks", command: "pnpm docs:check", recipeHash: "recipe_docs_v1" } }, versions: { create: { version: 1, snapshot: "Migration guide acceptance criteria", contentHash: "sha256:docs-v1" } }, escrow: { create: { status: "funded", paymentAmount: 125, walletAddress: "DemoTreasury111", simulated: true } },
  } });

  const contractRecipe = (criteria: string[], evidence: string[], recipeHash: string) => ({ deliverablesJson: JSON.stringify(["Merged implementation and reproducible evidence"]), acceptanceJson: JSON.stringify(criteria.map((label) => ({ label, description: label, measurable: true }))), evidenceJson: JSON.stringify(evidence.map((label) => ({ type: label.includes("pull") ? "pull_request" : "document", label, required: true }))), automatedChecksJson: JSON.stringify([{ type: "pull_request", label: "Pull request exists", config: {} }, { type: "evidence_present", label: "Required evidence fields are present", config: {} }, { type: "deadline", label: "Submission is before deadline", config: {} }]), humanChecksJson: JSON.stringify([{ label: "Outcome matches criteria", instruction: "Reviewer confirms every measurable criterion is satisfied." }]), failureBehavior: "request_changes", policyVersion: "1.0", canonicalJson: JSON.stringify({ criteria, evidence }), recipeHash });
  await prisma.outcomeContract.createMany({ data: [
    { taskId: task1.id, ...contractRecipe(["Parse compressed account changes", "Backfill is idempotent", "P95 latency stays under 120ms", "Add operational runbook"], ["GitHub pull request URL", "Benchmark report", "Contributor explanation"], "a".repeat(64)), reviewerProfileId: reviewer.id, approvedAt: new Date("2026-09-12T12:00:00Z") },
    { taskId: task2.id, ...contractRecipe(["Simulate SPL token transfers", "Flag writable account drift", "Export a shareable report"], ["GitHub pull request URL", "Contributor explanation"], "b".repeat(64)), reviewerProfileId: reviewer.id, approvedAt: new Date("2026-09-13T12:00:00Z") },
    { taskId: task3.id, ...contractRecipe(["Deduplicate on event id", "Record replay provenance", "Add failure recovery test"], ["GitHub pull request URL", "Contributor explanation"], "c".repeat(64)), reviewerProfileId: reviewer.id, approvedAt: new Date("2026-09-10T12:00:00Z") },
    { taskId: task4.id, ...contractRecipe(["Payment flow implemented", "Transaction confirmed", "Error handling included", "Documentation provided"], ["GitHub pull request URL", "Devnet transaction reference", "Contributor explanation"], "d".repeat(64)), reviewerProfileId: reviewer.id, approvedAt: new Date("2026-09-15T12:00:00Z") },
    { taskId: task5.id, ...contractRecipe(["Migration path is reproducible", "Compatibility notes included", "Rollback checklist included"], ["Documentation URL", "Contributor explanation"], "e".repeat(64)), reviewerProfileId: reviewer.id, approvedAt: new Date("2026-09-16T12:00:00Z") },
  ] });

  const submission1 = await prisma.submission.create({ data: {
    taskId: task1.id, contributorId: contributor.id, status: "awaiting_review", note: "Implemented the parser behind a feature flag and included replay fixtures from the 50k account benchmark. The runbook is drafted in the PR notes and ready for review.", explanation: "Implemented the parser behind a feature flag and included replay fixtures from the 50k account benchmark. The runbook is drafted in the PR notes and ready for review.", pullRequestUrl: "https://github.com/helius/indexer/pull/842", deploymentUrl: "https://staging.helius.dev/indexer", idempotencyKey: "seed-submission-indexer-v1", submittedAt: new Date("2026-09-16T08:42:00Z"), evidence: { create: [
      { type: "pull_request", title: "github.com/helius/indexer/pull/842", detail: "+1,284 / −192 lines · 14 files changed", href: "https://github.com/helius/indexer/pull/842", contentHash: "sha256:pr842" },
      { type: "benchmark", title: "Benchmark run #1842", detail: "P95 96ms · 50,000 accounts · 3m 12s", href: "https://ci.helius.dev/runs/1842", contentHash: "sha256:bench1842" },
      { type: "document", title: "Operational runbook draft", detail: "Notion · Updated 18 minutes ago", href: "https://notion.so/proofmesh/runbook", isPrivate: true },
      { type: "preview", title: "Indexer staging preview", detail: "staging.helius.dev/indexer", href: "https://staging.helius.dev/indexer" },
    ] }, verificationRuns: { create: [
      { label: "Repository checks", value: "184 / 184 passed", status: "passed", checkType: "github_repository", recipeHash: "a".repeat(64), checkedAt: new Date("2026-09-16T08:45:00Z") },
      { label: "Benchmark threshold", value: "96ms / 120ms", status: "passed", checkType: "evidence_present", recipeHash: "a".repeat(64), checkedAt: new Date("2026-09-16T08:45:00Z") },
      { label: "Human review", value: "Awaiting reviewer", status: "pending", checkType: "human", recipeHash: "a".repeat(64) },
    ] },
  } });
  const submission2 = await prisma.submission.create({ data: {
    taskId: task3.id, contributorId: contributor.id, status: "approved", note: "Replay keys are persisted with a 30-day retention window and surfaced in the operator audit view.", explanation: "Replay keys are persisted with a 30-day retention window and surfaced in the operator audit view.", pullRequestUrl: "https://github.com/drift-monitor/api/pull/118", idempotencyKey: "seed-submission-webhooks-v1", submittedAt: new Date("2026-09-13T15:26:00Z"), reviewedAt: new Date("2026-09-14T09:18:00Z"), evidence: { create: [
      { type: "pull_request", title: "github.com/drift-monitor/api/pull/118", detail: "+638 / −44 lines · 9 files changed", href: "https://github.com/drift-monitor/api/pull/118" },
      { type: "benchmark", title: "Integration suite #771", detail: "42 / 42 passed · 0 flaky tests", href: "https://ci.drift.monitor/runs/771" },
    ] }, verificationRuns: { create: [
      { label: "Repository checks", value: "42 / 42 passed", status: "passed", recipeHash: "recipe_webhooks_v1" },
      { label: "Human review", value: "Approved by Avery Rivera", status: "passed", recipeHash: "recipe_webhooks_v1" },
      { label: "Escrow settlement", value: "Released", status: "passed", recipeHash: "recipe_webhooks_v1" },
    ] }, reviews: { create: { reviewerId: reviewer.id, status: "approved", comment: "Verified all three criteria against the submitted evidence." } },
  } });
  const submission3 = await prisma.submission.create({ data: {
    taskId: task4.id, contributorId: contributorTwo.id, status: "approved", note: "Implemented the payment flow with explicit confirmation and a recoverable paused state.", explanation: "Implemented the payment flow with explicit confirmation and a recoverable paused state.", pullRequestUrl: "https://github.com/proofmesh/demo/pull/24", idempotencyKey: "seed-submission-payments-v1", submittedAt: new Date("2026-09-15T10:18:00Z"), reviewedAt: new Date("2026-09-15T16:42:00Z"), evidence: { create: [
      { type: "pull_request", title: "Payment flow implementation", detail: "Demo PR · 8 files changed", href: "https://github.com/proofmesh/demo/pull/24" },
      { type: "document", title: "Recovery notes", detail: "Paused settlement and retry behavior", href: "#", isPrivate: true },
    ] }, verificationRuns: { create: [
      { label: "Payment flow checks", value: "12 / 12 passed", status: "passed", recipeHash: "recipe_payments_v1" },
      { label: "Human review", value: "Approved by Avery Rivera", status: "passed", recipeHash: "recipe_payments_v1" },
    ] }, reviews: { create: { reviewerId: reviewer.id, status: "approved", comment: "Payment flow and recovery behavior verified against the Outcome Contract." } },
  } });
  const submission4 = await prisma.submission.create({ data: {
    taskId: task5.id, contributorId: contributorThree.id, status: "approved", note: "Published the migration guide with compatibility notes and a rollback checklist.", explanation: "Published the migration guide with compatibility notes and a rollback checklist.", pullRequestUrl: "https://github.com/proofmesh/docs/pull/12", idempotencyKey: "seed-submission-docs-v1", submittedAt: new Date("2026-09-16T11:05:00Z"), reviewedAt: new Date("2026-09-16T14:20:00Z"), evidence: { create: [
      { type: "document", title: "SDK migration guide", detail: "Runnable examples and compatibility notes", href: "#" },
      { type: "document", title: "Rollback checklist", detail: "Operator recovery path", href: "#" },
    ] }, verificationRuns: { create: [
      { label: "Documentation checks", value: "9 / 9 passed", status: "passed", recipeHash: "recipe_docs_v1" },
      { label: "Human review", value: "Approved by Avery Rivera", status: "passed", recipeHash: "recipe_docs_v1" },
    ] }, reviews: { create: { reviewerId: reviewer.id, status: "approved", comment: "Migration guide is reproducible and includes the requested recovery details." } },
  } });

  await prisma.proofReceipt.createMany({ data: [
    { taskId: task3.id, submissionId: submission2.id, contributorId: contributor.id, rewardAmount: 95000, verificationHash: "pm_7f4c…d902", transactionHash: "5wK2…rP91", payoutSignature: "5wK2…rP91", contentHash: "sha256:proof-webhooks", evidenceHash: "sha256:proof-webhooks", recipeHash: "c".repeat(64), recipeVersion: 1, outcomeContractHash: "c".repeat(64), contributorWallet: contributor.walletAddress, reviewerWallet: reviewer.walletAddress, sponsorOrganization: organization.slug },
    { taskId: task4.id, submissionId: submission3.id, contributorId: contributorTwo.id, rewardAmount: 200, verificationHash: "pm_82f1…a102", transactionHash: null, payoutSignature: null, contentHash: "sha256:proof-payments", evidenceHash: "sha256:proof-payments", recipeHash: "d".repeat(64), recipeVersion: 1, outcomeContractHash: "d".repeat(64), contributorWallet: contributorTwo.walletAddress, reviewerWallet: reviewer.walletAddress, sponsorOrganization: organization.slug },
    { taskId: task5.id, submissionId: submission4.id, contributorId: contributorThree.id, rewardAmount: 125, verificationHash: "pm_1b08…9ac1", transactionHash: null, payoutSignature: null, contentHash: "sha256:proof-docs", evidenceHash: "sha256:proof-docs", recipeHash: "e".repeat(64), recipeVersion: 1, outcomeContractHash: "e".repeat(64), contributorWallet: contributorThree.walletAddress, reviewerWallet: reviewer.walletAddress, sponsorOrganization: organization.slug },
    { taskId: task4.id, submissionId: (await prisma.submission.create({ data: { taskId: task4.id, contributorId: contributorFour.id, status: "approved", note: "Alternate payment integration submission for the Demo Mode passport.", idempotencyKey: "seed-submission-payments-v2", submittedAt: new Date("2026-09-12T10:00:00Z"), reviewedAt: new Date("2026-09-12T15:00:00Z") } })).id, contributorId: contributorFour.id, rewardAmount: 200, status: "revoked", verificationHash: "pm_4aa1…1f09", transactionHash: null, payoutSignature: null, contentHash: "sha256:proof-revoked", evidenceHash: "sha256:proof-revoked", recipeHash: "d".repeat(64), recipeVersion: 1, outcomeContractHash: "d".repeat(64), contributorWallet: contributorFour.walletAddress, reviewerWallet: reviewer.walletAddress, sponsorOrganization: organization.slug, revokedAt: new Date("2026-09-13T10:00:00Z") },
    { taskId: task3.id, submissionId: (await prisma.submission.create({ data: { taskId: task3.id, contributorId: contributorThree.id, status: "approved", note: "Additional reliability proof for reuse testing.", idempotencyKey: "seed-submission-reliability-v2", submittedAt: new Date("2026-09-11T10:00:00Z"), reviewedAt: new Date("2026-09-11T13:00:00Z") } })).id, contributorId: contributorThree.id, rewardAmount: 700, verificationHash: "pm_a55e…1b12", transactionHash: null, payoutSignature: null, contentHash: "sha256:proof-reliability", evidenceHash: "sha256:proof-reliability", recipeHash: "c".repeat(64), recipeVersion: 1, outcomeContractHash: "c".repeat(64), contributorWallet: contributorThree.walletAddress, reviewerWallet: reviewer.walletAddress, sponsorOrganization: organization.slug },
    { taskId: task5.id, submissionId: (await prisma.submission.create({ data: { taskId: task5.id, contributorId: contributorFour.id, status: "approved", note: "Additional documentation proof for the passport demo.", idempotencyKey: "seed-submission-docs-v2", submittedAt: new Date("2026-09-10T10:00:00Z"), reviewedAt: new Date("2026-09-10T13:00:00Z") } })).id, contributorId: contributorFour.id, rewardAmount: 500, verificationHash: "pm_0dc4…8c41", transactionHash: null, payoutSignature: null, contentHash: "sha256:proof-docs-v2", evidenceHash: "sha256:proof-docs-v2", recipeHash: "e".repeat(64), recipeVersion: 1, outcomeContractHash: "e".repeat(64), contributorWallet: contributorFour.walletAddress, reviewerWallet: reviewer.walletAddress, sponsorOrganization: organization.slug },
  ] });
  const proof = await prisma.proofReceipt.findUniqueOrThrow({ where: { submissionId: submission2.id } });
  await prisma.proofRequirement.createMany({ data: [
    { taskId: task2.id, title: "Verified Solana integration proof", description: "At least one active Proof-of-Work Receipt from a completed Solana reliability task is required to apply.", requiredCategory: "reliability", minActiveProofs: 1, ruleJson: JSON.stringify({ chain: "Solana", category: "reliability", status: "active", minActiveProofs: 1 }) },
    { taskId: task4.id, title: "Active Solana Integration proof", description: "One active receipt issued by an approved verifier is required before applying to the advanced payment task.", requiredCategory: "development", minActiveProofs: 1, ruleJson: JSON.stringify({ chain: "Solana", category: "development", status: "active", minActiveProofs: 1 }) },
  ] });
  const agentPolicy = await prisma.agentPolicy.create({ data: { organizationId: organization.id, ownerId: sponsor.id, name: "Solana triage agent", maxBudget: 80000, allowedCategories: JSON.stringify(["reliability", "tooling"]), allowedRecipients: JSON.stringify([contributor.id]), approvalThreshold: 25000, enabled: true, simulated: true } });
  await prisma.proofAccessEvent.create({ data: { proofReceiptId: proof.id, taskId: task2.id, contributorId: contributor.id, eventType: "eligibility_check" } });
  await prisma.financialAudit.createMany({ data: [
    { organizationId: organization.id, actorId: sponsor.id, action: "escrow_funded", entityType: "task", entityId: task1.id, amount: 240000, status: "confirmed", metadataJson: JSON.stringify({ network: "devnet", simulated: true }) },
    { organizationId: organization.id, actorId: reviewer.id, action: "payout_released", entityType: "proof", entityId: proof.id, amount: 95000, status: "confirmed", metadataJson: JSON.stringify({ network: "devnet", transactionHash: "5wK2…rP91" }) },
  ] });
  await prisma.agentRequest.create({ data: { policyId: agentPolicy.id, taskId: task2.id, recipientId: contributor.id, requestedAmount: 18000, status: "pending", requiresHumanApproval: false } });
  await prisma.activityEvent.createMany({ data: [
    { organizationId: organization.id, actorId: contributor.id, taskId: task1.id, submissionId: submission1.id, kind: "review", title: "Maya Chen submitted evidence", detail: "Upgrade indexer to compressed account support", color: "violet", href: "/submissions/sub-001", createdAt: new Date("2026-09-16T08:42:00Z") },
    { organizationId: organization.id, actorId: reviewer.id, taskId: task3.id, submissionId: submission2.id, kind: "verified", title: "Automated checks passed", detail: "42 checks on Add webhook replay protection", color: "emerald", href: "/submissions/sub-002", createdAt: new Date("2026-09-16T07:00:00Z") },
    { organizationId: organization.id, actorId: reviewer.id, taskId: task3.id, submissionId: submission2.id, kind: "issued", title: "Proof receipt issued", detail: "Add webhook replay protection · 950 USDC", color: "blue", href: "/proofs/proof-001", createdAt: new Date("2026-09-16T06:55:00Z") },
    { organizationId: organization.id, actorId: sponsor.id, taskId: task2.id, kind: "funded", title: "Escrow funded", detail: "Multi-sig transaction simulator · 1,800 USDC", color: "amber", href: "/tasks/task-002", createdAt: daysAgo(1) },
    { organizationId: organization.id, actorId: sponsor.id, taskId: task2.id, kind: "submitted", title: "Task moved to active", detail: "Multi-sig transaction simulator", color: "violet", href: "/tasks/task-002", createdAt: daysAgo(1) },
    { organizationId: organization.id, actorId: contributorTwo.id, taskId: task4.id, kind: "submitted", title: "Advanced payment task applied", detail: "Eligibility verified from an active receipt", color: "blue", href: "/access", createdAt: daysAgo(2) },
    { organizationId: organization.id, actorId: reviewer.id, taskId: task4.id, kind: "verified", title: "Payment integration verified", detail: "12 deterministic checks and human review passed", color: "emerald", href: "/submissions/sub-003", createdAt: daysAgo(2) },
    { organizationId: organization.id, actorId: contributorThree.id, taskId: task5.id, kind: "issued", title: "Proof reused for documentation work", detail: "Program development capability satisfied the recipe", color: "violet", href: "/proofs", createdAt: daysAgo(3) },
    { organizationId: organization.id, actorId: sponsor.id, taskId: task4.id, kind: "revoked", title: "Proof access paused", detail: "A revoked receipt no longer satisfies affected access rules", color: "red", href: "/proofs", createdAt: daysAgo(4) },
    { organizationId: organization.id, actorId: sponsor.id, taskId: task4.id, kind: "funded", title: "Agent request needs human approval", detail: "Reward crossed the configured 250 USDC threshold", color: "amber", href: "/agents", createdAt: daysAgo(4) },
  ] });

  console.log(`Seeded ${organization.name} with five tasks, six proofs, and Demo Mode audit fixtures`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());

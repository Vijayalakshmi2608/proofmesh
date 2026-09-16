import type { ActivityEvent, ProofReceipt, Submission, Task } from "./types";

export const tasks: Task[] = [
  {
    id: "task-001",
    title: "Upgrade indexer to compressed account support",
    summary: "Add deterministic parsing and backfill support for compressed account updates in the event indexer.",
    project: "Helius Indexer",
    chain: "Solana",
    status: "in_review",
    reward: 2400,
    currency: "USDC",
    submissions: 2,
    maxSubmissions: 3,
    dueDate: "Sep 18, 2026",
    createdAt: "Sep 09, 2026",
    sponsor: "0x7F…3A91",
    sponsorName: "Helius Labs",
    tags: ["Rust", "Geyser", "Performance"],
    acceptance: [
      { id: "a1", label: "Parse compressed account changes", description: "Decode account leaf updates from the Geyser stream without dropping sequence numbers.", passed: true },
      { id: "a2", label: "Backfill is idempotent", description: "Replaying a slot range produces the same indexed state on every run.", passed: true },
      { id: "a3", label: "P95 latency stays under 120ms", description: "Benchmark against the provided 50k account fixture on a clean runner.", passed: true },
      { id: "a4", label: "Add operational runbook", description: "Document replay, rollback, and monitoring steps for on-call engineers.", passed: false },
    ],
  },
  {
    id: "task-002",
    title: "Ship multi-sig transaction simulator",
    summary: "Build a safe simulation surface for wallet teams to inspect account diffs before signing.",
    project: "Squads Protocol",
    chain: "Solana",
    status: "active",
    reward: 1800,
    currency: "USDC",
    submissions: 0,
    maxSubmissions: 2,
    dueDate: "Sep 24, 2026",
    createdAt: "Sep 11, 2026",
    sponsor: "0xA3…B71C",
    sponsorName: "Squads Protocol",
    tags: ["TypeScript", "Simulation", "DX"],
    acceptance: [
      { id: "b1", label: "Simulate SPL token transfers", description: "Render pre/post balances and account diffs for a token transfer batch." },
      { id: "b2", label: "Flag writable account drift", description: "Detect writable accounts not declared by the transaction intent." },
      { id: "b3", label: "Export a shareable report", description: "Generate a stable JSON report with a human-readable summary." },
    ],
  },
  {
    id: "task-003",
    title: "Add webhook replay protection",
    summary: "Prevent duplicate settlement events and give operators a replay-safe audit trail.",
    project: "Drift Monitor",
    chain: "Solana",
    status: "verified",
    reward: 950,
    currency: "USDC",
    submissions: 1,
    maxSubmissions: 2,
    dueDate: "Sep 14, 2026",
    createdAt: "Sep 03, 2026",
    sponsor: "0x19…C09D",
    sponsorName: "Drift Monitor",
    tags: ["Webhooks", "Postgres", "Reliability"],
    acceptance: [
      { id: "c1", label: "Deduplicate on event id", description: "Duplicate delivery never triggers a second settlement." , passed: true },
      { id: "c2", label: "Record replay provenance", description: "Store delivery attempt, actor, and decision in an append-only log.", passed: true },
      { id: "c3", label: "Add failure recovery test", description: "Cover retry and partial outage behavior with an integration test.", passed: true },
    ],
  },
];

export const submissions: Submission[] = [
  {
    id: "sub-001",
    taskId: "task-001",
    taskTitle: "Upgrade indexer to compressed account support",
    contributor: "7pT9…K3xL",
    contributorName: "Maya Chen",
    status: "pending",
    submittedAt: "Sep 16, 2026 · 08:42",
    duration: "2d 4h",
    note: "Implemented the parser behind a feature flag and included replay fixtures from the 50k account benchmark. The runbook is drafted in the PR notes and ready for review.",
    evidence: [
      { id: "e1", type: "repository", title: "github.com/helius/indexer/pull/842", detail: "+1,284 / −192 lines · 14 files changed", href: "#", verified: true },
      { id: "e2", type: "benchmark", title: "Benchmark run #1842", detail: "P95 96ms · 50,000 accounts · 3m 12s", href: "#", verified: true },
      { id: "e3", type: "document", title: "Operational runbook draft", detail: "Notion · Updated 18 minutes ago", href: "#", verified: false },
      { id: "e4", type: "preview", title: "Indexer staging preview", detail: "staging.helius.dev/indexer", href: "#", verified: true },
    ],
    checks: [
      { label: "Repository checks", value: "184 / 184 passed", state: "passed" },
      { label: "Benchmark threshold", value: "96ms / 120ms", state: "passed" },
      { label: "Human review", value: "Awaiting reviewer", state: "pending" },
    ],
  },
  {
    id: "sub-002",
    taskId: "task-003",
    taskTitle: "Add webhook replay protection",
    contributor: "8xQ2…pL8F",
    contributorName: "Jon Bell",
    status: "verified",
    submittedAt: "Sep 13, 2026 · 15:26",
    reviewedAt: "Sep 14, 2026 · 09:18",
    duration: "18h 12m",
    note: "Replay keys are persisted with a 30-day retention window and surfaced in the operator audit view.",
    evidence: [
      { id: "e5", type: "repository", title: "github.com/drift-monitor/api/pull/118", detail: "+638 / −44 lines · 9 files changed", href: "#", verified: true },
      { id: "e6", type: "benchmark", title: "Integration suite #771", detail: "42 / 42 passed · 0 flaky tests", href: "#", verified: true },
    ],
    checks: [
      { label: "Repository checks", value: "42 / 42 passed", state: "passed" },
      { label: "Human review", value: "Approved by A. Rivera", state: "passed" },
      { label: "Escrow settlement", value: "Released", state: "passed" },
    ],
  },
];

export const proofs: ProofReceipt[] = [
  { id: "proof-001", taskId: "task-003", submissionId: "sub-002", taskTitle: "Add webhook replay protection", contributorName: "Jon Bell", contributor: "8xQ2…pL8F", issuedAt: "Sep 14, 2026 · 09:22", status: "issued", reward: 950, verificationHash: "pm_7f4c…d902", txHash: "5wK2…rP91", criteriaPassed: 3, criteriaTotal: 3 },
  { id: "proof-002", taskId: "task-089", submissionId: "sub-089", taskTitle: "Add wallet adapter telemetry", contributorName: "Priya Nair", contributor: "6aQ1…mR04", issuedAt: "Sep 10, 2026 · 14:05", status: "issued", reward: 1200, verificationHash: "pm_1b08…9ac1", txHash: "3iP1…xA28", criteriaPassed: 5, criteriaTotal: 5 },
  { id: "proof-003", taskId: "task-076", submissionId: "sub-076", taskTitle: "Audit token vesting claims", contributorName: "Noah Williams", contributor: "9mL4…eV17", issuedAt: "Sep 07, 2026 · 11:48", status: "issued", reward: 3200, verificationHash: "pm_a55e…1b12", txHash: "4zR7…tK42", criteriaPassed: 4, criteriaTotal: 4 },
  { id: "proof-004", taskId: "task-001", submissionId: "sub-001", taskTitle: "Upgrade indexer to compressed account support", contributorName: "Maya Chen", contributor: "7pT9…K3xL", issuedAt: "Pending review", status: "pending", reward: 2400, verificationHash: "Pending", txHash: "Pending", criteriaPassed: 3, criteriaTotal: 4 },
];

export const activity: ActivityEvent[] = [
  { id: "act-1", kind: "review", title: "Maya Chen submitted evidence", detail: "Upgrade indexer to compressed account support", timestamp: "18 min ago", actor: "Maya Chen", color: "violet", href: "/submissions/sub-001" },
  { id: "act-2", kind: "verified", title: "Automated checks passed", detail: "42 checks on Add webhook replay protection", timestamp: "2h ago", actor: "ProofMesh checks", color: "emerald", href: "/submissions/sub-002" },
  { id: "act-3", kind: "issued", title: "Proof receipt issued", detail: "Add webhook replay protection · 950 USDC", timestamp: "2h ago", actor: "ProofMesh", color: "blue", href: "/proofs/proof-001" },
  { id: "act-4", kind: "funded", title: "Escrow funded", detail: "Multi-sig transaction simulator · 1,800 USDC", timestamp: "1d ago", actor: "Squads Protocol", color: "amber", href: "/tasks/task-002" },
  { id: "act-5", kind: "submitted", title: "Task moved to active", detail: "Multi-sig transaction simulator", timestamp: "1d ago", actor: "Squads Protocol", color: "violet", href: "/tasks/task-002" },
];

export const getTask = (id: string) => tasks.find((task) => task.id === id) ?? tasks[0];
export const getSubmission = (id: string) => submissions.find((submission) => submission.id === id) ?? submissions[0];
export const getProof = (id: string) => proofs.find((proof) => proof.id === id) ?? proofs[0];

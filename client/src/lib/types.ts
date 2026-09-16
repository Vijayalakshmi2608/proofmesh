export type TaskStatus = "active" | "in_review" | "verified" | "settled" | "draft";
export type SubmissionStatus = "pending" | "verified" | "needs_changes" | "rejected";
export type ProofStatus = "issued" | "pending";

export interface AcceptanceCriterion {
  id: string;
  label: string;
  description: string;
  passed?: boolean;
}

export interface Task {
  id: string;
  title: string;
  summary: string;
  project: string;
  chain: "Solana";
  status: TaskStatus;
  reward: number;
  currency: "USDC";
  submissions: number;
  maxSubmissions: number;
  dueDate: string;
  createdAt: string;
  sponsor: string;
  sponsorName: string;
  acceptance: AcceptanceCriterion[];
  tags: string[];
}

export interface EvidenceItem {
  id: string;
  type: "repository" | "preview" | "benchmark" | "document";
  title: string;
  detail: string;
  href: string;
  verified: boolean;
}

export interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  contributor: string;
  contributorName: string;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  duration: string;
  note: string;
  evidence: EvidenceItem[];
  checks: { label: string; value: string; state: "passed" | "pending" | "failed" }[];
}

export interface ProofReceipt {
  id: string;
  taskId: string;
  submissionId: string;
  taskTitle: string;
  contributorName: string;
  contributor: string;
  issuedAt: string;
  status: ProofStatus;
  reward: number;
  verificationHash: string;
  txHash: string;
  criteriaPassed: number;
  criteriaTotal: number;
}

export interface ActivityEvent {
  id: string;
  kind: "verified" | "submitted" | "funded" | "issued" | "review";
  title: string;
  detail: string;
  timestamp: string;
  actor: string;
  color: "emerald" | "violet" | "amber" | "blue";
  href?: string;
}

export type TaskStatus = "active" | "in_review" | "verified" | "settled" | "draft";
export type SubmissionStatus = "pending" | "verified" | "needs_changes" | "rejected";
export type ProofStatus = "active" | "issued" | "pending" | "revoked" | "expired";
export type ProofType = "solana_integration" | "smart_contract_testing" | "program_development" | "reliability";
export type RequirementOperator = "all" | "any";

export interface AcceptanceCriterion { id: string; label: string; description: string; passed?: boolean; }
export interface ProofRequirement { id?: string; proofType: ProofType; label: string; requiredStatus: Extract<ProofStatus, "active" | "issued">; minimumCount: number; issuer?: string; expiresAfterDays?: number; }
export interface AccessRule { id: string; name: string; operator: RequirementOperator; requirements: ProofRequirement[]; minimumVerifiedProofs: number; explanation: string; }
export interface EligibilityResult { eligible: boolean; matchedProofs: ProofReceipt[]; unmetRequirements: ProofRequirement[]; proofStatus: ProofStatus | "none"; explanation: string; privateInformationProtected: string[]; accessRule: AccessRule; }
export interface TaskEligibility { taskId: string; taskTitle: string; eligible: boolean; requirement: AccessRule; result: EligibilityResult; }
export interface ProofGraphNode { id: string; label: string; type: "work" | "proof" | "task" | "application" | "settlement"; status?: string; href?: string; }

export interface Task { id: string; title: string; summary: string; project: string; chain: "Solana"; status: TaskStatus; reward: number; currency: "USDC"; submissions: number; maxSubmissions: number; dueDate: string; createdAt: string; sponsor: string; sponsorName: string; acceptance: AcceptanceCriterion[]; tags: string[]; proofRequirement?: AccessRule; proofRecipe?: { title: string; description: string; operator: RequirementOperator; requirements: { label: string; proofType: ProofType; requiredStatus: "active" | "issued"; minimumCount: number; issuer?: string }[] }; }
export interface EvidenceItem { id: string; type: "repository" | "preview" | "benchmark" | "document"; title: string; detail: string; href: string; verified: boolean; isPrivate?: boolean; }
export interface Submission { id: string; taskId: string; taskTitle: string; contributor: string; contributorName: string; status: SubmissionStatus; submittedAt: string; reviewedAt?: string; duration: string; note: string; evidence: EvidenceItem[]; checks: { label: string; value: string; state: "passed" | "pending" | "failed" }[]; }
export interface ProofReceipt { id: string; taskId: string; submissionId: string; taskTitle: string; contributorName: string; contributor: string; issuedAt: string; status: ProofStatus; reward: number; verificationHash: string; txHash: string; criteriaPassed: number; criteriaTotal: number; proofType?: ProofType; capability?: string; issuer?: string; expiresAt?: string; reuseCount?: number; revocationReason?: string; publicVisibility?: boolean; underlyingEvidence?: "private" | "redacted"; }
export interface ActivityEvent { id: string; kind: "verified" | "submitted" | "funded" | "issued" | "review" | "access" | "revoked"; title: string; detail: string; timestamp: string; actor: string; color: "emerald" | "violet" | "amber" | "blue" | "red"; href?: string; }

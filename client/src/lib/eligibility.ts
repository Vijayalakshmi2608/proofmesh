import type { AccessRule, EligibilityResult, ProofReceipt, ProofRequirement, ProofStatus, TaskEligibility, Task } from "./types";
import { getProof, getTask, proofs } from "./mockData";

export const advancedSolanaRule: AccessRule = {
  id: "rule-solana-integration-v1",
  name: "Advanced Solana Developer",
  operator: "all",
  minimumVerifiedProofs: 1,
  explanation: "One active, verified Solana Integration proof is enough to apply. The sponsor evaluates public receipt metadata only.",
  requirements: [{ id: "req-solana-integration", proofType: "solana_integration", label: "Active Solana Integration proof", requiredStatus: "active", minimumCount: 1, issuer: "Approved ProofMesh verifier" }],
};

export const recipeRule: AccessRule = {
  id: "recipe-advanced-solana-v1",
  name: "Advanced Solana Developer",
  operator: "all",
  minimumVerifiedProofs: 1,
  explanation: "ALL: Solana Integration + active status. OR: Smart Contract Testing or Solana Program Development can satisfy the alternate path.",
  requirements: [
    { id: "recipe-all-solana", proofType: "solana_integration", label: "Solana Integration proof", requiredStatus: "active", minimumCount: 1 },
    { id: "recipe-or-testing", proofType: "smart_contract_testing", label: "Smart Contract Testing", requiredStatus: "active", minimumCount: 1 },
    { id: "recipe-or-program", proofType: "program_development", label: "Solana Program Development", requiredStatus: "active", minimumCount: 1 },
  ],
};

const protectedFields = ["Repository contents are not disclosed", "Private screenshots are not disclosed", "Sensitive contributor information is not disclosed"];
function proofMatches(proof: ProofReceipt, requirement: ProofRequirement) { return proof.status === requirement.requiredStatus && (proof.proofType ?? "solana_integration") === requirement.proofType && (!requirement.issuer || proof.issuer === requirement.issuer); }

export function checkTaskEligibility(taskId: string, contributorId: string): TaskEligibility {
  const task = getTask(taskId);
  const rule = task.proofRequirement ?? advancedSolanaRule;
  const contributorProofs = proofs.filter((proof) => proof.contributor === contributorId || contributorId === "demo-contributor" || contributorId === "7pT9…K3xL");
  const primary = rule.requirements[0];
  const matches = contributorProofs.filter((proof) => proofMatches(proof, primary));
  const eligible = matches.length >= rule.minimumVerifiedProofs;
  const unmetRequirements = eligible ? [] : rule.requirements.filter((requirement) => !contributorProofs.some((proof) => proofMatches(proof, requirement)));
  const result: EligibilityResult = { eligible, matchedProofs: matches, unmetRequirements, proofStatus: matches[0]?.status ?? contributorProofs[0]?.status ?? "none", explanation: eligible ? `Eligible because ${matches[0]?.id ?? "an active proof"} satisfies ${primary.label}.` : `Locked because ${primary.minimumCount} ${primary.label} is required.`, privateInformationProtected: protectedFields, accessRule: rule };
  return { taskId, taskTitle: task.title, eligible, requirement: rule, result };
}

export function createTask(input: Partial<Task>) { return { ...getTask("task-002"), ...input, id: input.id ?? `task-demo-${Date.now()}` } as Task; }
export function checkEligibility(taskId: string, contributorId: string) { return checkTaskEligibility(taskId, contributorId); }
export function applyToTask(taskId: string, contributorId = "demo-contributor") { const eligibility = checkTaskEligibility(taskId, contributorId); if (!eligibility.eligible) throw new Error(eligibility.result.explanation); return { applied: true, taskId, proofId: eligibility.result.matchedProofs[0]?.id ?? "proof-demo", message: "Application recorded without exposing private evidence." }; }
export function verifyProof(proofId: string) { const proof = getProof(proofId); return { valid: proof.status === "active" || proof.status === "issued", proof, disclosed: ["status", "capability", "issuer", "verification date"], protected: protectedFields }; }
export function revokeProof(proofId: string, reason = "Verification is no longer valid.") { const proof = getProof(proofId); return { ...proof, status: "revoked" as ProofStatus, revocationReason: reason }; }
export function restoreProof(proofId: string) { const proof = getProof(proofId); return { ...proof, status: "active" as ProofStatus, revocationReason: undefined }; }

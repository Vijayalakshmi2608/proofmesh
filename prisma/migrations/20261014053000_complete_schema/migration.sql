-- AlterTable
ALTER TABLE "Submission" ADD COLUMN "deploymentUrl" TEXT;
ALTER TABLE "Submission" ADD COLUMN "explanation" TEXT;
ALTER TABLE "Submission" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "Submission" ADD COLUMN "pullRequestUrl" TEXT;

-- CreateTable
CREATE TABLE "OutcomeContract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deliverablesJson" TEXT NOT NULL,
    "acceptanceJson" TEXT NOT NULL,
    "evidenceJson" TEXT NOT NULL,
    "automatedChecksJson" TEXT NOT NULL,
    "humanChecksJson" TEXT NOT NULL,
    "failureBehavior" TEXT NOT NULL,
    "reviewerProfileId" TEXT,
    "policyVersion" TEXT NOT NULL,
    "canonicalJson" TEXT NOT NULL,
    "recipeHash" TEXT NOT NULL,
    "originalPrompt" TEXT,
    "generatedDraftJson" TEXT,
    "modelName" TEXT,
    "generatedAt" DATETIME,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OutcomeContract_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProofRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredCategory" TEXT NOT NULL,
    "minActiveProofs" INTEGER NOT NULL DEFAULT 1,
    "ruleJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProofRequirement_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProofAccessEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proofReceiptId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProofAccessEvent_proofReceiptId_fkey" FOREIGN KEY ("proofReceiptId") REFERENCES "ProofReceipt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProofAccessEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProofAccessEvent_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxBudget" INTEGER NOT NULL,
    "allowedCategories" TEXT NOT NULL,
    "allowedRecipients" TEXT NOT NULL,
    "approvalThreshold" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "simulated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgentPolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AgentPolicy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policyId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "requestedAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requiresHumanApproval" BOOLEAN NOT NULL DEFAULT true,
    "approvedById" TEXT,
    "decisionComment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgentRequest_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "AgentPolicy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AgentRequest_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AgentRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AgentRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinancialAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "amount" INTEGER,
    "status" TEXT NOT NULL,
    "metadataJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialAudit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FinancialAudit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProofReceipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "publicVisibility" BOOLEAN NOT NULL DEFAULT true,
    "rewardAmount" INTEGER NOT NULL,
    "verificationHash" TEXT NOT NULL,
    "transactionHash" TEXT,
    "contentHash" TEXT,
    "recipeHash" TEXT,
    "contributorWallet" TEXT,
    "sponsorOrganization" TEXT,
    "outcomeContractHash" TEXT,
    "evidenceHash" TEXT,
    "recipeVersion" INTEGER,
    "reviewerWallet" TEXT,
    "payoutSignature" TEXT,
    "credentialNetwork" TEXT NOT NULL DEFAULT 'demo',
    "credentialCommitment" TEXT,
    "credentialProgram" TEXT,
    "issuanceSignature" TEXT,
    "revocationSignature" TEXT,
    "credentialVersion" INTEGER NOT NULL DEFAULT 1,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    "expiresAt" DATETIME,
    CONSTRAINT "ProofReceipt_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProofReceipt_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProofReceipt" ("contentHash", "contributorId", "expiresAt", "id", "issuedAt", "publicVisibility", "recipeHash", "revokedAt", "rewardAmount", "status", "submissionId", "taskId", "transactionHash", "verificationHash") SELECT "contentHash", "contributorId", "expiresAt", "id", "issuedAt", "publicVisibility", "recipeHash", "revokedAt", "rewardAmount", "status", "submissionId", "taskId", "transactionHash", "verificationHash" FROM "ProofReceipt";
DROP TABLE "ProofReceipt";
ALTER TABLE "new_ProofReceipt" RENAME TO "ProofReceipt";
CREATE UNIQUE INDEX "ProofReceipt_submissionId_key" ON "ProofReceipt"("submissionId");
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "repositoryUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'protocol',
    "chain" TEXT NOT NULL DEFAULT 'Solana',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "paymentAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USDC',
    "tokenMint" TEXT,
    "deadline" DATETIME,
    "disputeWindow" INTEGER NOT NULL DEFAULT 72,
    "maxSubmissions" INTEGER NOT NULL DEFAULT 2,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("chain", "createdAt", "currency", "deadline", "disputeWindow", "id", "maxSubmissions", "organizationId", "paymentAmount", "project", "sponsorId", "status", "summary", "title", "tokenMint", "updatedAt") SELECT "chain", "createdAt", "currency", "deadline", "disputeWindow", "id", "maxSubmissions", "organizationId", "paymentAmount", "project", "sponsorId", "status", "summary", "title", "tokenMint", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_organizationId_status_idx" ON "Task"("organizationId", "status");
CREATE TABLE "new_VerificationRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "recipeHash" TEXT,
    "checkType" TEXT NOT NULL DEFAULT 'automated',
    "details" TEXT,
    "checkedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationRun_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VerificationRun" ("createdAt", "id", "label", "recipeHash", "status", "submissionId", "value") SELECT "createdAt", "id", "label", "recipeHash", "status", "submissionId", "value" FROM "VerificationRun";
DROP TABLE "VerificationRun";
ALTER TABLE "new_VerificationRun" RENAME TO "VerificationRun";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "OutcomeContract_taskId_key" ON "OutcomeContract"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "ProofRequirement_taskId_key" ON "ProofRequirement"("taskId");

-- CreateIndex
CREATE INDEX "ProofAccessEvent_contributorId_createdAt_idx" ON "ProofAccessEvent"("contributorId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentPolicy_organizationId_enabled_idx" ON "AgentPolicy"("organizationId", "enabled");

-- CreateIndex
CREATE INDEX "AgentRequest_taskId_status_idx" ON "AgentRequest"("taskId", "status");

-- CreateIndex
CREATE INDEX "FinancialAudit_organizationId_createdAt_idx" ON "FinancialAudit"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_idempotencyKey_key" ON "Submission"("idempotencyKey");


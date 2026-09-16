# ProofMesh threat model

The prototype assumes that a contributor, sponsor, reviewer, or agent may be curious, mistaken, or actively malicious. The primary security objective is to prevent unauthorized eligibility, payout, private-evidence disclosure, and policy mutation.

## Assets

The protected assets are Outcome Contract versions and hashes, private evidence links and metadata, organization membership, proof receipt status, wallet transaction intent, escrow state, and financial audit records. Public proof commitments are intentionally lower-sensitivity than source code or private evidence.

The local SQLite prototype has no row-level security (RLS) policies to audit. Its equivalent boundary is the server-side organization and role check in every service. A production managed database must add, enumerate, and independently review RLS policies for organizations, tasks, submissions, evidence, proofs, agent requests, and financial audit rows before launch.

## Threats and controls

| Threat | Control in this prototype | Remaining limitation |
| --- | --- | --- |
| Client forges organization ID | Services resolve organization from controlled server-side Demo Mode identity | Demo Mode headers are not production authentication |
| Contributor applies without a qualifying proof | `checkEligibility` requires an active public receipt with matching chain and category | Provider attestations are simulated |
| Revoked proof remains usable | Eligibility queries filter `status = active`; revocation records `revokedAt` | External credential propagation is not implemented |
| Public verifier reads private evidence | Public proof service returns receipt commitments, not evidence rows | Production storage and CDN access policies need independent review |
| Agent exceeds budget or recipient scope | Server-side category, recipient, aggregate budget, and threshold checks | No production scheduler or agent runtime exists |
| Agent approves its own work | Approval requires a human sponsor/reviewer and blocks owner/recipient self-approval | Production identity binding is still required |
| Agent changes an Outcome Contract | Agent API has request-only operations and no contract mutation path | Production policy engine should enforce immutable contract versions on-chain or in a managed database |
| Duplicate payout | Idempotency keys, proof receipt lookup, policy-hash checks, and audit events | Smart-contract idempotency must be audited separately |
| Wallet sends an unintended payment | UI displays explicit transaction preview and requires confirmation | Prototype uses simulated/devnet flows |
| Financial state is changed without trace | `FinancialAudit` records action, entity, amount, status, and metadata | Audit log is local SQLite and not append-only under an adversarial database operator |
| Malformed recipe or task input | Zod validation and canonical recipe hash | Fuzzing and property-based tests should be added before production |

## Incident recovery

The product should enter a **paused** state when a payout provider, escrow program, proof registry, or verification provider is unavailable. In the current prototype, failed mutations surface an error toast and preserve the prior state. A production implementation must add an operator-controlled pause flag, replay-safe recovery jobs, alerting, and a documented reconciliation process.

## High-priority production work

Replace Demo Mode with authenticated sessions, enforce row-level access policies in the managed database, isolate secrets to server-side environment variables, add independent smart-contract review, validate webhook signatures, encrypt private evidence references, and run adversarial tests against every financial transition.

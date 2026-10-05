# ProofMesh integration API

ProofMesh exposes a small integration boundary for organizations that want to consume portable reputation without importing private evidence.

## Read-only endpoints

All endpoints require a server-resolved Demo Mode identity in this prototype. Production deployments should replace that header with an authenticated organization/member session.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/reputation/graph` | Returns contributor, completed-work, public-proof, issuer, and opportunity nodes plus relationship edges. |
| `GET /api/reputation/history` | Returns verifiable completed-work history, active/revoked counts, and reuse counts. |
| `GET /api/opportunities` | Evaluates currently open tasks and explains qualification, missing requirements, supporting proofs, and excluded revoked/expired credentials. |
| `GET /api/verify/proof/:id` | Returns public receipt status and commitment without private evidence. |
| `GET /api/solana/protocol-status` | Reports whether a configured Devnet Anchor program address is executable. |

## Reputation graph semantics

- `contributor → work` means a persisted submission exists.
- `work → proof` means the submission produced a persisted Proof-of-Work Receipt.
- `issuer → proof` means the sponsor organization issued that receipt.
- `proof → opportunity` means a persisted access event links the credential to the task.
- `revoked` and `expired` edges remain in history but never qualify an opportunity.

The graph is deliberately derived from Prisma records (and, when deployed, verified Solana account/transaction state) rather than profile text or frontend fixtures.

## Portable receipt contract

A consuming organization should store the public receipt ID, credential commitment, issuer, network, status, capability/category, and verification timestamp. It should not request or mirror repository contents, screenshots, private evidence links, or personal documents. Re-check status before each eligibility or payment decision; active status is not permanent.

## Solana primitive boundary

The Anchor workspace in `programs/proofmesh_protocol` defines reusable PDA primitives:

1. `issue_credential` / `verify_credential` / `revoke_credential`
2. `fund_escrow` with a task-hash PDA and program-owned token vault
3. `claim_escrow` gated by an active credential and recipient signer
4. `approve_escrow` gated by the configured reviewer
5. `release_escrow` with PDA-signed token transfer
6. `close_escrow` after release and empty-vault verification

The hosted prototype does not claim these primitives are deployed. A consumer must verify the executable Devnet program ID, generated IDL, confirmed transaction signature, and account state before treating a receipt or escrow event as on-chain fact.

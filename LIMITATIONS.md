# ProofMesh limitations

ProofMesh is a hackathon prototype for the product loop **VERIFY → PROVE → UNLOCK → WORK → SETTLE → REUSE**. It is not production financial infrastructure, an audited escrow program, or a production identity system.

## Current prototype boundaries

The local application uses Demo Mode identities, a SQLite database, seeded records, and mock service fallbacks when the API is unavailable. The browser must never be treated as the source of truth for eligibility, authorization, organization membership, reviewer authority, or payout state; the server-side services perform those checks when the API is running.

Solana interactions are Devnet-only and simulated where the interface says **Demo transaction**. The application does not create or store private keys, does not claim that a simulated settlement is a real financial transfer, and does not provide a production escrow smart contract. Wallet connection is limited to the configured Devnet provider surface.

Proof receipts expose public metadata such as capability, issuer, status, verification date, and a commitment hash. They do not expose repository contents, private screenshots, personal documents, emails, or sensitive contributor evidence. A revoked proof must not satisfy access rules.

The current SQLite prototype does not provide database-level row-level security. Organization scoping and role checks are implemented in service code and covered by tests, but production deployment requires a database with audited RLS policies, transaction isolation, secret management, and independent security review.

GitHub, deployment, automated verification, AI assistance, notifications, dispute handling, and settlement recovery are represented by bounded interfaces or deterministic demo services. They must be replaced with signed, replay-safe integrations before production use.

## Production work required

Production readiness requires an audited Solana escrow and payout program, multisignature treasury controls, idempotent settlement workers, immutable audit export, proof revocation propagation, key rotation, rate limiting, abuse monitoring, privacy review, legal review, and independent penetration testing. Proof recipes and reviewer policies also require versioned migrations and a formal change-approval process.

Nothing in this prototype constitutes investment, payment, employment, tax, legal, or financial advice. Do not deposit real funds or rely on a receipt for a consequential decision until the production controls have been implemented and audited.

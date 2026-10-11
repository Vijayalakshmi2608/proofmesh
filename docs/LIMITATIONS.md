# ProofMesh limitations

ProofMesh is a hackathon prototype. Demo Mode uses seeded identities and an application-level SQLite ledger. It does not represent real settlement or on-chain credentials.

GitHub and deployment checks are deterministic simulations around submitted metadata. They are not live provider attestations. The simulated AI agent cannot execute code, approve its own work, alter outcome contracts, or move funds.

The Anchor credential and escrow program is production-structured source code, but it is not deployed or audited in this environment. Real Devnet mode currently uses the legacy SPL transfer adapter when Phantom signs and the Solana RPC confirms a transaction. The UI must not treat this as credential-gated Anchor escrow until a verified executable program and IDL are configured.

The current production deployment shape uses SQLite on a Render persistent disk. This requires a paid single-instance service and does not support horizontal scaling. A production multi-instance deployment should migrate Prisma to managed Postgres and add operational backups, monitoring, and a tested disaster-recovery procedure.

ProofMesh is not financial, legal, employment, tax, investment, or regulatory advice. Devnet balances and simulated receipts have no monetary value. A production launch requires jurisdiction-specific review, custody and money-transmission analysis, sanctions screening, privacy review, and an independent smart-contract security assessment.

# ProofMesh architecture

```text
Web App
   ↓
ProofMesh API
   ↓
Proof Engine ──→ Privacy / Policy Layer
   ↓                    ↓
Eligibility Engine → Task Engine
   ↓                    ↓
Proof Passport      Review + Audit
          \          /
           Solana Devnet Settlement
```

The React/Vite frontend provides the landing page, workspace shell, task wizard, reviewer workspace, Proof Passport, public verification surface, Proof Graph, and simulated Agent Console. React Query keeps API reads and mutations cacheable while local seeded fallbacks make the hackathon walkthrough resilient when the API is not running.

The Express API derives Demo Mode identities from controlled role headers and resolves organization membership server-side. Prisma persists tasks, Outcome Contracts, submissions, verification runs, reviews, proof receipts, proof requirements, access events, agent policies, agent requests, and financial audit events in SQLite for the prototype.

The Proof Engine stores canonical recipe hashes and deterministic verification results. The Eligibility Engine evaluates proof requirements and access rules against active receipts and records reuse events. The Privacy / Policy Layer limits public verification to receipt metadata and keeps evidence private. The Task Engine handles task state, submissions, reviewer actions, and idempotent payout transitions.

The current Devnet settlement panel and payout records are explicitly simulated. Production replacement points include an audited Solana escrow program, signed attestations, real provider integrations, a production identity/session layer, database RLS, secret management, and an operator recovery service.

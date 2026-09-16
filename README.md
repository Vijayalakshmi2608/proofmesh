# ProofMesh

ProofMesh is an outcome-bound work verification and settlement platform for Solana/Web3 teams. A sponsor defines an exact Outcome Contract, a contributor submits evidence, deterministic checks and a human reviewer verify the result, and a Proof-of-Work Receipt records the accepted outcome. A receipt can later unlock eligibility for another task without exposing private evidence.

## Product surfaces

The public landing page explains the workflow, architecture, benefits, Devnet-only status, and pilot path. The workspace includes task creation, contributor submission, reviewer decisions, public proof verification, Proof-to-Access eligibility, and a simulated AI-agent governance surface.

## Local setup

```bash
pnpm install
export DATABASE_URL="file:./dev.db"
pnpm prisma generate
pnpm db:push
pnpm db:seed
```

The local SQLite database is created from `DATABASE_URL`. Copy `.env.example` to `.env` if preferred. Demo seed data includes three tasks, two submissions, one active proof, a Proof-to-Access rule, an agent policy, an agent request, and financial audit events.

## Run the app

```bash
pnpm dev
```

The managed development server serves the React frontend and REST API. The API is available under `/api`.

For a production-like local run:

```bash
pnpm build
DATABASE_URL="file:./dev.db" NODE_ENV=production node dist/index.js
```

## Demo Mode

Demo Mode is not production authentication. It provides stable sponsor, contributor, reviewer, admin, and public-verifier identities. The selected role is persisted locally for the browser, while permissions are checked on the server from the controlled demo role header. Browser-supplied organization IDs are never trusted.

Use **Settings → Demo Mode → Reset Demo Mode** to restore the seeded walkthrough. Reset is restricted to Demo Mode sponsor/admin roles and does not move funds or touch external services.

## Devnet instructions

1. Install a Solana wallet extension such as Phantom.
2. Switch the wallet network to **Devnet**.
3. Connect from the ProofMesh workspace.
4. Use the explicit transaction preview before confirming any simulated escrow or payout action.
5. Fund the wallet with Devnet SOL from a public faucet if a real wallet signature is being tested.

The product currently labels blockchain activity as simulated or Devnet-only. No mainnet funds are used. A production deployment must replace the simulated settlement path with an audited escrow program, configured mint, transaction confirmation, replay protection, and incident recovery procedures.

## Tests and build

```bash
pnpm check
pnpm test
pnpm build
```

The test suite covers policy and recipe validation, public proof visibility, task lifecycle constraints, Proof-to-Access eligibility, agent allowlists and approval thresholds, payout safety, metrics, and API validation. Browser smoke testing should cover `/`, `/dashboard`, `/tasks`, `/tasks/new`, `/tasks/task-001`, `/submissions/sub-001`, `/proofs`, `/proofs/proof-001`, `/verify/proof-001`, `/access`, `/agents`, and `/settings`.

## Security posture

All workflow services perform server-side authorization and Zod input validation. Financial state transitions are idempotency-aware and recorded in `FinancialAudit`. Public proof verification exposes receipt commitments and status only; it does not expose private evidence. Proof-to-Access checks use active public receipt metadata, chain, category, and verification commitments. Agent requests are constrained by server-side category, recipient, budget, and approval policies. See [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) for the threat model and open risks.

## Known limitations

This hackathon prototype uses Demo Mode identities and a local SQLite database. GitHub and deployment checks are deterministic simulations around submitted metadata rather than live provider attestations. OpenRouter recipe generation is optional and disabled unless a server-side connector is configured. Agent execution is simulated; it does not autonomously execute code, approve work, alter contracts, or move funds. Proof revocation is modeled locally and does not yet propagate to external credential registries. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

## Regulatory disclaimer

ProofMesh is a software prototype for coordinating technical work and demonstrating verifiable settlement flows. It is not financial, legal, employment, tax, investment, or regulatory advice. Devnet balances and simulated receipts have no monetary value. Any production launch requires jurisdiction-specific review, custody and money-transmission analysis, sanctions screening, privacy review, and independent smart-contract security assessment.

## License and open-source direction

The repository is structured for open review. Before a production release, add an explicit license, contributor policy, dependency policy, security disclosure process, and audited escrow implementation.

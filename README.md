# ProofMesh

ProofMesh is an outcome-bound work verification and settlement platform for Solana/Web3 teams. A sponsor defines an exact Outcome Contract, a contributor submits evidence, deterministic checks and a human reviewer verify the result, and a Proof-of-Work Receipt records the accepted outcome. A receipt can later unlock eligibility for another task without exposing private evidence.

## Product surfaces

The public landing page explains the workflow, architecture, benefits, Devnet-only status, and pilot path. The workspace includes task creation, contributor submission, reviewer decisions, public proof verification, Proof-to-Access eligibility, and a simulated AI-agent governance surface. Sponsors can author reusable Proof Recipes with strict **ALL** or **ANY** logic. Each recipe is hashed with the Outcome Contract, persisted server-side, and evaluated against active public receipt metadata only.

Proof receipts now expose an explicit credential commitment layer: network (`demo` or `solana-devnet`), commitment hash, credential version, issuance signature when a real Devnet payout exists, and revocation signature when a receipt is revoked. Demo Mode labels this as an application-level commitment ledger; it does not claim that a Solana credential program has been deployed. Real Devnet credential-program support is integration-ready through `SOLANA_CREDENTIAL_PROGRAM` but remains opt-in and unclaimed until an audited program address is configured.

## Local setup

```bash
pnpm install
export DATABASE_URL="file:./dev.db"
pnpm prisma generate
pnpm db:push
pnpm db:seed
```

The local SQLite database is created from `DATABASE_URL`. Demo seed data includes five tasks, four named contributors, six proof receipts (including active and revoked states), multiple submissions, ten activity events, Proof-to-Access rules, an agent policy, an agent request, and financial audit events.

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

## Two explicit application modes

ProofMesh starts in **Demo Mode** so a judge can explore the complete workflow without Phantom, Devnet SOL, or configuration. Demo Mode uses stable sponsor, contributor, reviewer, and public-verifier identities, seeded Task A/Task B records, and server-validated role permissions. Browser-supplied organization IDs are never trusted.

The mode switch is available in the workspace topbar and under **Settings → Demo Mode**:

| Mode | Wallet requirement | Financial behavior |
| --- | --- | --- |
| **Demo Mode** | None | Uses isolated records and deterministic IDs such as `demo-tx-task-002-fund`. Every action is labeled **DEMO — Simulated Transaction** and never calls Solana. |
| **Real Devnet** | Phantom connected to Solana Devnet | Requires the real wallet, Devnet RPC, and explicit wallet confirmation. It never silently falls back to simulation. |

For the two-to-three-minute walkthrough, choose **Demo Mode**, open the active task, accept it, submit evidence, switch the demo role to Reviewer, run checks, approve, and use the simulated payout panel to view the receipt. Use **Settings → Demo Mode → Reset Demo** to restore the deterministic dataset; reset does not move funds or touch external Devnet data.

## Real Phantom wallet and Devnet instructions

1. Install [Phantom](https://phantom.app/download) for your browser.
2. In Phantom, open the network selector and switch the active network to **Devnet**.
3. Start ProofMesh locally with `pnpm dev`, open **Settings → Wallets**, and choose **Connect Phantom**.
4. Confirm that the diagnostics panel shows the connected public key, **Solana Devnet**, reachable RPC, and a real SOL balance. ProofMesh never displays a fake balance.
5. Request free Devnet SOL from the [Solana faucet](https://faucet.solana.com/) or another trusted Devnet faucet, then use **Refresh balance**.
6. If you use a private or paid Devnet RPC, set `VITE_SOLANA_RPC_URL` in the local environment to an HTTPS Devnet endpoint. If unset, ProofMesh uses `https://api.devnet.solana.com`.

The wallet connection and balance read use the real Phantom adapter and Solana Devnet RPC. Real Devnet mode requires Phantom and never fakes a connected wallet or balance. Phantom does not expose its active network through the current adapter API in every browser; when that signal is unavailable, the UI explicitly shows **Devnet target · wallet network unverified** and instructs you to switch Phantom manually rather than silently treating it as Devnet. Demo Mode remains available as the no-wallet path.

## Anchor protocol infrastructure

The repository now includes an Anchor workspace under `programs/proofmesh_protocol`. The program is structured around two PDA families:

- `credential` PDA: `issuer + recipient + proof_hash`, with issuer-only revocation, explicit active/revoked status, fixed-size proof/category commitments, and expiry validation.
- `escrow` PDA: `task_hash`, with a program-owned token vault. Funding records the sponsor, reviewer, recipient, mint, amount, and task commitment. Claim requires the recipient and an active credential; approval requires the configured reviewer; release requires claimed + approved state and uses PDA signer seeds for the vault transfer.

The Rust code includes strict Anchor constraints (`seeds`, `bump`, `has_one`, `address`, token mint/authority constraints), duplicate-state guards, replay-safe one-way transitions, events, custom errors, and unit tests for fixed commitment sizes and invalid-state primitives.

The current hosted prototype does **not** claim that this program is deployed. Set `SOLANA_PROTOCOL_PROGRAM_ID` only after deploying the program to Devnet and verifying that the address is executable. The API endpoint `/api/solana/protocol-status` checks that state against Devnet RPC. Until then, Real Devnet Mode uses the existing real SPL-token transfer adapter and labels it **legacy settlement infrastructure**, not credential-gated on-chain escrow. Demo Mode remains fully isolated and never calls Solana.

To build and test the program in an Anchor-enabled environment:

```bash
anchor build
anchor test --provider.cluster localnet
# after deployment and wallet funding:
anchor test --provider.cluster devnet
```

The generated Anchor IDL and deployed program address are intentionally not committed as if they were real. This prevents fabricated transaction claims and keeps the browser state tied to verified RPC/program state.

## Tests and build

```bash
pnpm check
pnpm test
pnpm build
```

The test suite covers policy and recipe validation, public proof visibility, task lifecycle constraints, Proof-to-Access eligibility, agent allowlists and approval thresholds, payout safety, metrics, API validation, wallet state classification, and a lightweight live Devnet RPC request. Browser smoke testing should cover `/`, `/dashboard`, `/tasks`, `/tasks/new`, `/tasks/task-001`, `/submissions/sub-001`, `/proofs`, `/proofs/proof-001`, `/verify/proof-001`, `/verify/proof/proof-001`, `/access`, `/agents`, `/graph`, `/demo`, and `/settings`.

## Render deployment

The recommended deployment is a single Node.js Web Service that serves the React SPA and Express API together. See [docs/RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md) and the checked-in [render.yaml](render.yaml) for the exact commands, health check, environment variables, and SQLite persistent-disk boundary. The Render connector is not enabled in this session, so no live Render deployment is claimed.

## Security posture

All workflow services perform server-side authorization and Zod input validation. Financial state transitions are idempotency-aware and recorded in `FinancialAudit`. Public proof verification exposes receipt commitments and status only; it does not expose private evidence. Proof-to-Access checks use active public receipt metadata, chain, category, and verification commitments. Agent requests are constrained by server-side category, recipient, budget, and approval policies. See [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) for the threat model and open risks.

## Known limitations

This hackathon prototype uses Demo Mode identities and a local SQLite database. GitHub and deployment checks are deterministic simulations around submitted metadata rather than live provider attestations. OpenRouter recipe generation is optional and disabled unless a server-side connector is configured. Agent execution is simulated; it does not autonomously execute code, approve work, alter contracts, or move funds. The Anchor protocol source is production-structured but not deployed or audited in this environment; the browser therefore does not claim on-chain credential issuance or credential-gated escrow. The existing Real Devnet SPL transfer is real when Phantom signs and RPC confirms it, but remains a legacy settlement adapter until the Anchor IDL/program is configured. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md), [docs/LIMITATIONS.md](docs/LIMITATIONS.md), and [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).

## Regulatory disclaimer

ProofMesh is a software prototype for coordinating technical work and demonstrating verifiable settlement flows. It is not financial, legal, employment, tax, investment, or regulatory advice. Devnet balances and simulated receipts have no monetary value. Any production launch requires jurisdiction-specific review, custody and money-transmission analysis, sanctions screening, privacy review, and independent smart-contract security assessment.

## License and open-source direction

The repository is structured for open review. Before a production release, add an explicit license, contributor policy, dependency policy, security disclosure process, and audited escrow implementation.

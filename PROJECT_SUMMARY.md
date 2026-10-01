# ProofMesh — Complete Project Summary

## 1. Product overview

ProofMesh is an outcome-bound work verification and settlement platform for Solana/Web3 teams. It gives sponsors and contributors a shared, explicit finish line: a sponsor defines a technical task and acceptance criteria, a contributor submits evidence, deterministic checks and a human reviewer verify the result, settlement is recorded, and ProofMesh issues a portable Proof-of-Work Receipt. Active receipts can later unlock eligibility for future tasks without exposing private evidence. The product promise is **Proof once. Unlock work everywhere.**

The project is implemented as a polished dark startup-quality web application designed for hackathon judging and future production evolution. It uses React, TypeScript, Vite, Tailwind CSS, accessible component patterns, React Router, TanStack Query, Lucide icons, Recharts where useful, Express, Prisma, and SQLite for the local prototype backend.

## 2. Current delivery state

The project has progressed through two major implementation phases beyond the initial frontend foundation.

### Phase 1: Real Phantom and Solana Devnet connectivity

The original mock wallet surface was replaced with real Phantom wallet-adapter connectivity. The application now supports persisted Phantom auto-connect, a configurable Solana Devnet RPC endpoint, live public-key display, live SOL balance reads, RPC reachability checks, and explicit wallet diagnostics. It distinguishes disconnected, connecting, connected, wrong-network, unavailable, rejected, RPC failure, and balance failure states.

Real Devnet mode does not fake wallet connection, public keys, balances, or successful transactions. When the adapter cannot expose Phantom’s active network, the UI explicitly reports that the Devnet target is unverified and instructs the user to switch Phantom manually.

### Phase 2: Demo Mode and Real Devnet separation

The product now supports two clearly separated application modes:

| Mode | Purpose | Financial behavior |
| --- | --- | --- |
| **Demo Mode** | Immediate, no-setup hackathon walkthrough | No Phantom, wallet, SOL, or blockchain call. Financial actions are labeled **DEMO — Simulated Transaction** and use deterministic demo IDs. |
| **Real Devnet** | Genuine Solana testnet experience | Requires Phantom and uses the configured Solana Devnet RPC. It never silently falls back to simulation. |

The selected mode is persisted in browser local storage and can be changed from the workspace topbar or Settings. The workspace displays a persistent banner so simulated and real activity cannot be visually confused.

The final Phase 2 checkpoint is `3b12ad9a`.

## 3. Frontend experience

### Public landing page

The landing page uses a near-black visual system with restrained violet accents, slate panels, emerald success states, amber pending states, deliberate whitespace, and responsive layouts. It includes:

- The value proposition: “Ship the work. Prove the outcome.”
- Before/after workflow comparison.
- Sponsor benefits.
- Contributor benefits.
- Architecture explanation.
- Product preview showing Proof-to-Access.
- Open-source direction.
- Solana Devnet disclosure.
- A primary **Try the Demo** CTA.
- A secondary **Connect Solana Devnet** CTA.
- Clear copy explaining that judges can explore without a wallet or connect Phantom for real Devnet settlement.

### Workspace shell

The shared application shell includes:

- Persistent responsive sidebar.
- Topbar with command palette access.
- Role switcher for sponsor, contributor, reviewer, and public verifier demo identities.
- Demo/Real Devnet mode switch.
- Wallet button with real Phantom diagnostics.
- Mode-specific status banner.
- Keyboard-friendly navigation and visible focus states.
- Toast feedback through Sonner.
- Responsive mobile navigation.

### Implemented routes

The application includes the following routes and surfaces:

- `/` — public landing page.
- `/dashboard` — workspace metrics, activity, tasks, proof reuse, settlement, and quick actions.
- `/tasks` — task registry and filtering.
- `/tasks/new` — multi-step Outcome Contract creation wizard.
- `/tasks/:id` — task details, acceptance criteria, contract data, workflow state, and settlement controls.
- `/submissions/:id` — contributor evidence and reviewer workspace.
- `/proofs` — Proof Passport and receipt list.
- `/proofs/:id` — receipt detail.
- `/verify/:id` — public proof verification.
- `/verify/proof/:id` — public verification alias.
- `/access` — Proof-to-Access eligibility and unlocked tasks.
- `/graph` — Proof Graph visualization surface.
- `/agents` — simulated AI-agent governance demo.
- `/demo` — three-minute in-app Demo Guide.
- `/settings` — profile, notifications, review policy, wallet diagnostics, mode switching, and demo reset.

## 4. Reusable UI components

The project contains reusable components for the main product language and workflow states, including:

- `AppShell`
- `Sidebar`
- `Topbar`
- `WalletButton`
- `WalletDiagnostics`
- `StatusBadge`
- `MetricCard`
- `TaskCard`
- `TaskStatusTimeline`
- `VerificationChecklist`
- `EvidenceCard`
- `ProofReceiptCard`
- `PaymentSummary`
- `EmptyState`
- `ErrorState`
- `ConfirmDialog`
- `ActivityTimeline`
- `CommandPalette`
- `DevnetTransactionPanel`

The transaction panel is mode-aware. In Demo Mode it displays a simulated transaction panel, never accesses `sendTransaction`, never opens the Solana explorer, and records a deterministic ID such as `demo-tx-task-002-fund`. In Real Devnet Mode it constructs and submits the actual SPL-token transaction through the connected wallet and Devnet RPC.

## 5. Backend and data model

The backend is an Express REST API backed by Prisma and SQLite for local Demo Mode and prototype development. The schema includes organizations, members, profiles, tasks, Outcome Contracts, submissions, evidence, verification checks, escrow records, proof receipts, proof requirements, proof reuse events, agent policies, agent requests, activity events, financial audit records, and related workflow state.

The server uses:

- Prisma schema and seed data.
- Zod validation for API inputs.
- Server-side Demo Mode authorization helpers.
- Organization-scoped queries.
- Stable public IDs such as `task-001` and `sub-001`.
- Idempotency-aware submission and payout logic.
- Public-safe proof serializers.
- Explicit simulated settlement state.
- Financial audit records.
- Local Demo Mode reset service.

The backend does not trust client-supplied organization identifiers. Service methods derive the organization from the controlled Demo Mode identity and apply authorization checks before mutations.

## 6. Seeded Demo Mode data

The Demo Mode seed contains:

- Five tasks.
- Four contributor identities.
- Six proof receipts.
- Active, revoked, reused, and privacy-safe receipt examples.
- Multiple submissions and evidence bundles.
- Ten audit/activity events.
- Proof-to-Access requirements and reuse history.
- Simulated agent policy and request fixtures.
- Financial audit events.
- A completed task lifecycle and active task lifecycle for judge walkthroughs.

The intended walkthrough is:

1. Start in Demo Mode.
2. Open an active task.
3. Review the acceptance criteria and reward.
4. Accept the task as the contributor.
5. Submit evidence.
6. Switch to the reviewer demo role.
7. Run deterministic checks.
8. Review the evidence and approve.
9. Use the simulated settlement action.
10. Open the resulting Proof-of-Work Receipt and contribution history.

The Settings → Demo Mode panel provides a confirmation-protected **Reset Demo** action that restores the deterministic local dataset without moving real funds or touching external Devnet records.

## 7. Proof-to-Access

Proof-to-Access makes Proof-of-Work Receipts useful beyond a single payment. A task can require a qualifying proof, such as an active proof for a verified Solana integration. The eligibility checker evaluates:

- Proof status.
- Revocation state.
- Expiration state.
- Chain and category.
- Capability metadata.
- Issuer and verification commitments.
- Reuse history.

The contributor-facing experience clearly explains why the user is eligible, which proof satisfied the requirement, whether the proof is active or revoked, and what remains private. Public verification does not expose private evidence.

### Proof Recipes

Sponsors can define strict reusable Proof Recipes while creating an Outcome Contract. Recipes support **ALL** logic, where every requirement must match, and **ANY** logic, where one qualifying requirement is sufficient. Each requirement can define a proof type, required status, minimum count, issuer, and human-readable label.

The recipe is validated with Zod, included in canonical contract data, hashed with the contract, and persisted in `ProofRequirement.ruleJson`. The server evaluates the recipe against public proof metadata only. Legacy seeded rules are normalized into the same internal recipe structure so existing Demo Mode data remains compatible.

### Proof Graph

The Proof Graph visualizes how verified outcomes branch into reusable receipts and downstream work. It now includes:

- An active Solana Integration branch.
- An active Solana Program Development branch.
- A revoked Reliability Engineering branch.
- Active branch counts and revoked branch counts.
- Blocked reuse-event metrics for revoked proofs.
- ALL/ANY recipe evaluation context.
- A downstream settlement node reachable only from active branches.

Active branches use emerald styling and remain connected to eligible work. Revoked branches use red styling, muted status, blocked task labels, and a re-verification message. Revocation preserves audit history and prior reuse events, but it removes the proof from future access decisions and prevents the branch from reaching settlement. The graph never renders private repository contents, screenshots, personal documents, or sensitive contributor evidence.

## 8. Simulated AI-agent mode

The AI-agent surface is explicitly labeled as a simulated prototype. It demonstrates governance constraints including:

- Maximum budget.
- Allowlisted task categories.
- Allowlisted recipients.
- Human approval thresholds.
- No self-approval.
- No contract modification.
- No autonomous fund movement.
- A local simulated request queue.

The agent can request an approved task, but it cannot approve its own work or bypass reviewer policy.

## 9. Security and safety model

The project includes the following safety boundaries:

- Real Devnet actions require wallet connection and explicit wallet confirmation.
- Demo Mode cannot call Solana transaction methods.
- Demo financial actions require deterministic `demo-tx-*` identifiers.
- Real Devnet inputs require the Devnet network and are not accepted as simulated records.
- Simulated settlement records are marked as simulated in the database.
- Duplicate payouts are blocked when a proof receipt already exists.
- Policy-hash mismatches are rejected.
- Workflow inputs are validated with Zod.
- Financial transitions are logged through audit records.
- Public proof endpoints expose only privacy-safe receipt commitments.
- Private evidence is not exposed to public verifiers.
- Demo reset is protected and local-only.
- No seed phrases or private keys are requested or stored.

The local SQLite prototype does not provide production-grade database row-level security. A production deployment must add database-enforced RLS, managed identity, audited smart contracts, custody controls, and independent security review.

## 10. Testing and verification

The final validation included:

- TypeScript check: passed.
- Production Vite and Express build: passed.
- Automated tests: **20 passed**.
- Wallet state classification tests: passed.
- Live Devnet RPC diagnostics test: passed.
- Demo mode identity and deterministic transaction ID tests: passed.
- Backend workflow and authorization tests: passed.
- Route smoke tests: all requested routes returned HTTP 200.
- API health and metrics smoke tests: passed.
- Invalid demo settlement guard: correctly rejected non-deterministic demo transaction input.
- Landing page browser verification: both new CTAs rendered.
- Fresh-browser console verification: no console output/errors.
- Managed WebDev diagnostics: TypeScript and language-service diagnostics clean; dev server running.

## 11. Documentation artifacts

The repository contains:

- `README.md` — setup, modes, Devnet instructions, walkthrough, testing, security, and limitations.
- `ARCHITECTURE.md` — high-level system architecture and replacement points.
- `THREAT_MODEL.md` — threat analysis and production security requirements.
- `DEMO.md` — concise three-minute demo guide.
- `LIMITATIONS.md` — prototype limitations and production replacement requirements.
- `docs/ARCHITECTURE.md` — detailed architecture and trust boundaries.
- `docs/THREAT_MODEL.md` — extended threat model.
- `docs/DEMO_SCRIPT.md` — judge-facing three-minute demo script.
- `.env.example` — local database, Demo reset, and optional Solana RPC configuration.

## 12. Known limitations

This is a hackathon-quality prototype rather than a production financial platform. Known limitations include:

- Demo Mode identities are controlled fixtures rather than real authentication.
- The local SQLite database is not a production multi-tenant database.
- GitHub and deployment checks are deterministic simulations around submitted metadata.
- Proof revocation is local and does not propagate to external credential registries.
- Agent execution is simulated.
- The wallet adapter may not expose Phantom’s active network in every browser.
- Real SPL-token escrow and payout flows remain Devnet prototype functionality and require configured token accounts and wallets.
- Mainnet, custody, production smart contracts, compliance, sanctions screening, and regulatory workflows are not implemented.
- The repository still needs an explicit production license, contributor policy, dependency policy, and security disclosure process.

## 13. Recommended next steps

1. Add a guided Demo Mode state machine that automatically moves the judge through the seeded sponsor, contributor, reviewer, settlement, and receipt roles.
2. Add server-side wallet ownership verification using signed messages before associating a real wallet with a contributor or sponsor identity.
3. Implement audited escrow contracts and a dedicated transaction confirmation service for production-grade Solana settlement.
4. Replace local Demo Mode identities with managed authentication and database-enforced organization isolation.
5. Add Playwright browser tests for mode switching, Demo Reset, wallet failure states, and the complete judge walkthrough.
6. Add production-grade monitoring, rate limits, structured logs, and alerting around financial transitions.

## 14. Final checkpoint

The latest verified project checkpoint is `8348742b`. It includes the separated Demo/Devnet modes, real Phantom connectivity, mode-aware settlement surfaces, seeded Demo Mode, Proof-to-Access, strict ALL/ANY Proof Recipes, Proof Passport, branch-aware Proof Graph with revocation effects, agent governance, documentation, and the completed validation pass.

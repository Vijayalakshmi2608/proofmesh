# ProofMesh three-minute demo

## 0:00–0:25 — The problem

Open the landing page and state: “ProofMesh turns technical work into an outcome-bound workflow. Sponsors define the finish line, contributors submit evidence, reviewers verify the result, and settlement follows the proof.” Point out the explicit Solana Devnet disclosure.

## 0:25–1:05 — Sponsor creates the contract

Open the workspace and navigate to **Tasks → New task**. Walk through the four-step Outcome Contract wizard. Emphasize measurable acceptance criteria, deterministic checks, evidence requirements, recipe provenance, and the publish confirmation. Do not claim a live mainnet transaction.

## 1:05–1:45 — Contributor submits and receives a receipt

Switch Demo Mode to Contributor. Open the seeded task and show the evidence fields, automated checks, human review timeline, and payout confirmation boundary. Open **Proof receipts** and then **Verify**. Explain that the public verifier sees commitments and status, not private source code or evidence contents.

## 1:45–2:20 — Proof-to-Access

Open **Proof-to-Access**. Show the sponsor-defined rule: one active Solana reliability proof. The page explains why the contributor is eligible, which receipt satisfied the rule, and what is not disclosed. Click **Apply with proof**. The API records an access event without copying private evidence into the future task.

## 2:20–2:50 — Simulated AI-agent mode

Open **Agent demo**. Show the allowlisted categories, recipient list, maximum budget, and human approval threshold. Request a small task below the threshold, then request a larger task above it. Explain that the agent can propose but cannot modify contracts, approve its own work, or move funds in this prototype.

## 2:50–3:00 — Reset and close

Open **Settings → Demo Mode** and show the reset control. Close with: “The prototype is Devnet-only. The next production steps are authenticated organizations, live provider attestations, audited escrow, and operational pause/recovery.”

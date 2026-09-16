# ProofMesh

ProofMesh is an outcome-bound work verification and settlement platform for Solana/Web3 teams. This repository contains the dark React workspace plus a SQLite-backed REST API in Demo Mode.

## Setup

```bash
pnpm install
export DATABASE_URL="file:./dev.db"
pnpm db:generate
pnpm db:push
pnpm db:seed
```

The local SQLite database is stored at `prisma/dev.db` when using `DATABASE_URL="file:./dev.db"`. For a shell-local environment file, create `.env` with that single variable.

## Run

Frontend preview:

```bash
pnpm dev
```

API + built frontend:

```bash
pnpm build
DATABASE_URL="file:./dev.db" pnpm dev:server
```

The REST API is available under `/api`. The frontend sends the current Demo Mode role in the `x-demo-role` header.

## Test

```bash
pnpm check
pnpm test
pnpm build
```

## Demo Mode

Demo Mode is not production authentication. It provides four stable identities for frontend and API development: `sponsor`, `contributor`, `reviewer`, and `public_verifier`. The selected role is persisted in local storage for the browser. Backend permissions are still enforced server-side from the controlled demo role header; organization membership is resolved on the server and browser-supplied organization IDs are not trusted.

Blockchain transactions and settlement are explicitly simulated until Solana integration is added.

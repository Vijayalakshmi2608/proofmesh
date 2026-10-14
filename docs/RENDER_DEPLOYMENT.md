# Render deployment

## Recommended service type

ProofMesh is a **single Render Web Service**, not a Static Site. The service must host both the Express API and the compiled React application because the current product uses REST routes under `/api` and server-side Prisma access.

The checked-in [`render.yaml`](../render.yaml) is the reproducible Blueprint. It uses:

- **Runtime:** Node.js
- **Build:** `pnpm install --frozen-lockfile --prod=false && pnpm prisma generate && pnpm build`
- **Start:** `pnpm prisma migrate deploy && pnpm render:init && pnpm start`
- **Health check:** `/api/health`
- **Port:** `process.env.PORT`
- **Host:** `0.0.0.0`
- **Region:** Singapore in the Blueprint; change it if the team or database is hosted elsewhere.

The start command runs migrations after the service starts because Render mounts persistent disks only at runtime. Running `prisma migrate deploy` in a pre-deploy command would target a separate environment and would not safely initialize the SQLite file on the mounted disk.

## SQLite persistence

The Blueprint attaches a 1 GB persistent disk at `/opt/render/project/src/data` and sets:

```text
DATABASE_URL=file:/opt/render/project/src/data/proofmesh.db
```

This is intentionally a **paid 0.5 CPU / 512 MB service**. Render Free web services have an ephemeral filesystem and cannot attach persistent disks. Without this disk, the SQLite database and all task, proof, review, and audit data can disappear on restart or redeploy.

For a free or horizontally scaled deployment, migrate Prisma to Render Postgres instead of using SQLite. Do not deploy the current SQLite schema to a free service and describe it as durable.

The Blueprint sets `SEED_DEMO_DATA=true` and runs `pnpm render:init` at startup. This initializer checks the profile count first: it seeds the deterministic demo dataset only when the database is completely empty, then skips seeding on every later restart. It never resets a non-empty database. Set `SEED_DEMO_DATA=false` for a production instance that should start empty, or remove the variable entirely.

## Environment variables

The Blueprint supplies safe non-secret defaults for `NODE_ENV`, `DATABASE_URL`, and `VITE_SOLANA_RPC_URL`. Add these values in Render’s Environment settings when applicable:

| Variable                     | Required                      | Purpose                                                                                                 |
| ---------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                   | Yes                           | Set to `production`.                                                                                    |
| `DATABASE_URL`               | Yes                           | SQLite URL on the persistent disk, or a PostgreSQL URL after a provider migration.                      |
| `VITE_SOLANA_RPC_URL`        | No                            | Public Devnet RPC used by the browser. Defaults to Solana Devnet if omitted.                            |
| `SEED_DEMO_DATA`             | Demo only                     | When `true`, seed only an empty database once during startup. Never use this as a data-reset mechanism. |
| `CORS_ORIGIN`                | Only for split-origin clients | Comma-separated exact origins allowed to call the API. Leave unset for the same-origin service.         |
| `SOLANA_PROTOCOL_PROGRAM_ID` | No                            | Only set after the Anchor program is deployed and verified executable on Devnet.                        |
| `SOLANA_CREDENTIAL_PROGRAM`  | No                            | Optional credential-program configuration; never put a private key here.                                |
| `VITE_DEVNET_USDC_MINT`      | No                            | Optional public Devnet token mint used by the wallet UI.                                                |

Never put Phantom secret keys, Solana keypairs, database passwords, or API tokens in `VITE_*` variables. Vite embeds `VITE_*` values in browser assets. Use Render secret environment variables for server-only credentials.

## Verification checklist

After the first deploy:

1. Open `https://<service>.onrender.com/api/health`. It must return HTTP 200 with `database: "ready"`.
2. Open the root URL and refresh directly on `/dashboard`, `/tasks`, `/proofs`, `/access`, and `/graph`. The Express SPA fallback must serve the React shell.
3. Call `/api/tasks` with `x-demo-role: sponsor` and confirm a JSON envelope. An unknown `/api/not-a-route` path must return JSON 404, not `index.html`.
4. Confirm Demo Mode is labeled simulated and does not create Solana transactions.
5. In Real Devnet Mode, confirm Phantom, the RPC endpoint, and transaction signatures before treating settlement as real.
6. Inspect startup logs for the migration result and confirm the service binds to the Render-provided port.

## Deployment limitation for this session

The Render connector exists in the local configuration but is disabled. No Render service, repository connection, deploy, log inspection, or live URL can be truthfully claimed from this session. Enable the Render connector in Manus settings or deploy the Blueprint from the Render Dashboard after connecting the repository.

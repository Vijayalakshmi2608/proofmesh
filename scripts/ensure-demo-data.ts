import { spawnSync } from "node:child_process";
import { prisma } from "../server/db";

async function main() {
  if (process.env.SEED_DEMO_DATA !== "true") {
    console.log(
      "Demo initialization disabled; preserving existing database contents"
    );
    return;
  }

  const profileCount = await prisma.profile.count();
  if (profileCount > 0) {
    console.log(
      `Demo initialization skipped; database already contains ${profileCount} profile(s)`
    );
    return;
  }

  console.log(
    "Database is empty; seeding the deterministic ProofMesh demo dataset once"
  );
  const result = spawnSync("pnpm", ["db:seed"], {
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0)
    throw new Error(
      `Demo seed failed with exit code ${result.status ?? "unknown"}`
    );
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

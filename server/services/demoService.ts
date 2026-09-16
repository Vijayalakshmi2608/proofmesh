import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import type { DemoUser } from "../demo";
const execFileAsync = promisify(execFile);
export async function resetDemo(user: DemoUser) { if (!user.id.startsWith("demo-") || !["sponsor", "admin"].includes(user.role)) throw Object.assign(new Error("Only a Demo Mode sponsor or admin can reset fixtures"), { status: 403 }); if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_RESET !== "true") throw Object.assign(new Error("Demo reset is disabled in production"), { status: 403 }); await execFileAsync("pnpm", ["db:seed"], { cwd: path.resolve(process.cwd()), env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db" } }); return { reset: true, mode: "demo", message: "Seeded demo data restored. No real wallet, escrow, or external funds were changed." }; }

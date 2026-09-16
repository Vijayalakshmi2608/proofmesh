import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { getDemoUser, demoUsers } from "./demo";
import { prisma } from "./db";
import { listActivity } from "./services/activityService";
import { dashboardMetrics, listOrganizations } from "./services/dashboardService";
import { listProofs, getProof, verifyProof } from "./services/proofService";
import { addEvidence, createSubmission, getSubmission, listSubmissions, reviewSubmission } from "./services/submissionService";
import { createTask, getTask, listTasks, updateTask } from "./services/taskService";
import { generateRecipe, validateRecipe, createOutcomeContract, getOutcomeContract } from "./services/recipeService";
import { runDeterministicChecks } from "./services/verificationService";
import { acceptTask, submitEvidence, fundTask, releasePayout } from "./services/workflowService";
import { summarizeEvidence } from "./services/aiService";

export const apiRouter = Router();
apiRouter.use((req, _res, next) => { req.demoUser = getDemoUser(req); next(); });

function handler(fn: (req: Request, res: Response) => Promise<unknown>) { return (req: Request, res: Response) => fn(req, res).then((data) => res.json({ data })).catch((error: unknown) => { const status = typeof error === "object" && error && "status" in error && typeof error.status === "number" ? error.status : error instanceof z.ZodError ? 400 : 500; const message = error instanceof Error ? error.message : "Unexpected server error"; res.status(status).json({ error: { code: status === 400 ? "VALIDATION_ERROR" : status === 403 ? "FORBIDDEN" : status === 404 ? "NOT_FOUND" : "SERVER_ERROR", message } }); }); }

apiRouter.get("/health", (_req, res) => res.json({ data: { ok: true, service: "proofmesh-api", network: "devnet", simulatedBlockchain: true } }));
apiRouter.get("/demo/session", (req, res) => res.json({ data: { user: req.demoUser, availableRoles: Object.values(demoUsers) } }));
apiRouter.get("/organizations", handler((req) => listOrganizations(req.demoUser)));
apiRouter.get("/tasks", handler((req) => listTasks(req.demoUser)));
apiRouter.post("/tasks", handler((req) => createTask(req.demoUser, req.body)));
apiRouter.post("/contracts/generate-recipe", handler((req) => generateRecipe(z.string().min(20).parse(req.body.prompt))));
apiRouter.post("/contracts/validate-recipe", handler(async (req) => validateRecipe(req.body.recipe)));
apiRouter.post("/contracts", handler((req) => createOutcomeContract(req.demoUser, req.body)));
apiRouter.get("/tasks/:id", handler((req) => getTask(req.demoUser, req.params.id)));
apiRouter.get("/tasks/:id/contract", handler((req) => getOutcomeContract(req.demoUser, req.params.id)));
apiRouter.patch("/tasks/:id", handler((req) => updateTask(req.demoUser, req.params.id, req.body)));
apiRouter.post("/tasks/:id/accept", handler((req) => acceptTask(req.demoUser, req.params.id)));
apiRouter.post("/tasks/:id/submit", handler((req) => submitEvidence(req.demoUser, req.params.id, req.body)));
apiRouter.post("/tasks/:id/fund", handler((req) => fundTask(req.demoUser, req.params.id, req.body)));
apiRouter.get("/submissions", handler((req) => listSubmissions(req.demoUser)));
apiRouter.get("/submissions/:id", handler((req) => getSubmission(req.demoUser, req.params.id)));
apiRouter.post("/submissions", handler((req) => createSubmission(req.demoUser, req.body)));
apiRouter.post("/submissions/:id/evidence-submit", handler((req) => submitEvidence(req.demoUser, req.params.id, req.body)));
apiRouter.post("/submissions/:id/run-checks", handler((req) => runDeterministicChecks(req.demoUser, req.params.id)));
apiRouter.post("/submissions/:id/ai-summary", handler((req) => summarizeEvidence(req.demoUser, req.params.id)));
apiRouter.post("/submissions/:id/evidence", handler((req) => addEvidence(req.demoUser, req.params.id, req.body)));
apiRouter.post("/submissions/:id/review", handler((req) => reviewSubmission(req.demoUser, req.params.id, req.body)));
apiRouter.post("/submissions/:id/release", handler((req) => releasePayout(req.demoUser, req.params.id, req.body)));
apiRouter.get("/proofs", handler((req) => listProofs(req.demoUser)));
apiRouter.get("/proofs/:id", handler((req) => getProof(req.demoUser, req.params.id)));
apiRouter.get("/verify/:id", handler((req) => verifyProof(req.params.id)));
apiRouter.get("/activity", handler((req) => listActivity(req.demoUser)));
apiRouter.get("/dashboard/metrics", handler((req) => dashboardMetrics(req.demoUser)));

export async function closeApi() { await prisma.$disconnect(); }

declare global { namespace Express { interface Request { demoUser: ReturnType<typeof getDemoUser> } } }

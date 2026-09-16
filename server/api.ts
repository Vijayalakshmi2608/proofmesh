import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { getDemoUser, demoUsers } from "./demo";
import { prisma } from "./db";
import { listActivity } from "./services/activityService";
import { dashboardMetrics, listOrganizations } from "./services/dashboardService";
import { listProofs, getProof, verifyProof } from "./services/proofService";
import { addEvidence, createSubmission, getSubmission, listSubmissions, reviewSubmission } from "./services/submissionService";
import { createTask, getTask, listTasks, updateTask } from "./services/taskService";

export const apiRouter = Router();
apiRouter.use((req, _res, next) => { req.demoUser = getDemoUser(req); next(); });

function handler(fn: (req: Request, res: Response) => Promise<unknown>) { return (req: Request, res: Response) => fn(req, res).then((data) => res.json({ data })).catch((error: unknown) => { const status = typeof error === "object" && error && "status" in error && typeof error.status === "number" ? error.status : error instanceof z.ZodError ? 400 : 500; const message = error instanceof Error ? error.message : "Unexpected server error"; res.status(status).json({ error: { code: status === 400 ? "VALIDATION_ERROR" : status === 403 ? "FORBIDDEN" : status === 404 ? "NOT_FOUND" : "SERVER_ERROR", message } }); }); }

apiRouter.get("/health", (_req, res) => res.json({ data: { ok: true, service: "proofmesh-api", simulatedBlockchain: true } }));
apiRouter.get("/demo/session", (req, res) => res.json({ data: { user: req.demoUser, availableRoles: Object.values(demoUsers) } }));
apiRouter.get("/organizations", handler((req) => listOrganizations(req.demoUser)));
apiRouter.get("/tasks", handler((req) => listTasks(req.demoUser)));
apiRouter.post("/tasks", handler((req) => createTask(req.demoUser, req.body)));
apiRouter.get("/tasks/:id", handler((req) => getTask(req.demoUser, req.params.id)));
apiRouter.patch("/tasks/:id", handler((req) => updateTask(req.demoUser, req.params.id, req.body)));
apiRouter.get("/submissions", handler((req) => listSubmissions(req.demoUser)));
apiRouter.get("/submissions/:id", handler((req) => getSubmission(req.demoUser, req.params.id)));
apiRouter.post("/submissions", handler((req) => createSubmission(req.demoUser, req.body)));
apiRouter.post("/submissions/:id/evidence", handler((req) => addEvidence(req.demoUser, req.params.id, req.body)));
apiRouter.post("/submissions/:id/review", handler((req) => reviewSubmission(req.demoUser, req.params.id, req.body)));
apiRouter.get("/proofs", handler((req) => listProofs(req.demoUser)));
apiRouter.get("/proofs/:id", handler((req) => getProof(req.demoUser, req.params.id)));
apiRouter.get("/verify/:id", handler((req) => verifyProof(req.params.id)));
apiRouter.get("/activity", handler((req) => listActivity(req.demoUser)));
apiRouter.get("/dashboard/metrics", handler((req) => dashboardMetrics(req.demoUser)));

export async function closeApi() { await prisma.$disconnect(); }

declare global { namespace Express { interface Request { demoUser: ReturnType<typeof getDemoUser> } } }

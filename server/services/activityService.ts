import type { DemoUser } from "../demo";
import { prisma } from "../db";
import { serializeActivity } from "./serializers";
export async function listActivity(user: DemoUser) { if (!user.organizationSlug) return []; const org = await prisma.organization.findUnique({ where: { slug: user.organizationSlug } }); if (!org) return []; const events = await prisma.activityEvent.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: "desc" }, take: 50 }); return events.map(serializeActivity); }

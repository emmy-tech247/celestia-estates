import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  const u = await requireUser("AGENT");
  const [properties, published, newLeads, openLeads, upcoming] = await Promise.all([
    prisma.property.count({ where: { agentId: u.id, status: { not: "ARCHIVED" } } }),
    prisma.property.count({ where: { agentId: u.id, status: "PUBLISHED" } }),
    prisma.lead.count({ where: { assignedAgentId: u.id, stage: "NEW" } }),
    prisma.lead.count({ where: { assignedAgentId: u.id, stage: { notIn: ["WON", "LOST"] } } }),
    prisma.inspection.count({ where: { agentId: u.id, status: { in: ["PENDING", "APPROVED", "RESCHEDULED"] }, scheduledAt: { gte: new Date() } } }),
  ]);
  return json({ properties, published, newLeads, openLeads, upcomingInspections: upcoming });
});

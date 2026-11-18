import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  const [totalProperties, activeListings, totalLeads, newLeads, pendingInspections, agents, partners, pendingCommissions] = await Promise.all([
    prisma.property.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.property.count({ where: { status: "PUBLISHED" } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { stage: "NEW" } }),
    prisma.inspection.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: { name: "AGENT" } } }),
    prisma.referralPartner.count({ where: { status: "APPROVED" } }),
    prisma.commission.count({ where: { status: "PENDING" } }),
  ]);
  return json({ totalProperties, activeListings, totalLeads, newLeads, pendingInspections, agents, partners, pendingCommissions });
});

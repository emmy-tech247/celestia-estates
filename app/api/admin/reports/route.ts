import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getFunnel } from "@/lib/analytics";

export const GET = handle(async (req) => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  const days = Math.min(365, Math.max(1, Number(new URL(req.url).searchParams.get("days") ?? 30) || 30));
  const [funnel, byStatus, leadsByStage, revenue, commissions] = await Promise.all([
    getFunnel(days),
    prisma.property.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["stage"], _count: { _all: true } }),
    prisma.payment.aggregate({ where: { status: "SUCCESSFUL" }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.commission.groupBy({ by: ["status"], _sum: { amount: true }, _count: { _all: true } }),
  ]);
  return json({ funnel, propertiesByStatus: byStatus, leadsByStage, revenue: { total: revenue._sum.amount, payments: revenue._count._all }, commissions });
});

import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  const u = await requireUser("AGENT");
  const items = await prisma.inspection.findMany({
    where: { agentId: u.id },
    orderBy: { scheduledAt: "asc" },
    include: { property: { select: { title: true } }, customer: { select: { fullName: true, phone: true, email: true } } },
  });
  return json({ items });
});

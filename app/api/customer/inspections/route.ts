import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  const u = await requireUser("CUSTOMER");
  const items = await prisma.inspection.findMany({
    where: { customerId: u.id },
    orderBy: { scheduledAt: "desc" },
    include: { property: { select: { title: true, slug: true } }, agent: { select: { fullName: true, phone: true } } },
  });
  return json({ items });
});

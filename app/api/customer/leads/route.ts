import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  const u = await requireUser("CUSTOMER");
  const items = await prisma.lead.findMany({
    where: { customerId: u.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, stage: true, createdAt: true, property: { select: { title: true, slug: true } } },
  });
  return json({ items });
});

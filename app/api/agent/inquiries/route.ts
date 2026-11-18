import { prisma } from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  const u = await requireUser("AGENT");
  const items = await prisma.inquiry.findMany({
    where: { assignedAgentId: u.id },
    orderBy: { createdAt: "desc" },
    include: { property: { select: { title: true, slug: true } } },
  });
  return json({ items });
});

import { prisma } from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async (req) => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  const status = new URL(req.url).searchParams.get("status");
  const items = await prisma.inquiry.findMany({
    where: status ? { status: status.toUpperCase() as "NEW" } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      property: { select: { title: true, slug: true } },
      assignedAgent: { select: { id: true, fullName: true } },
    },
  });
  return json({ items });
});

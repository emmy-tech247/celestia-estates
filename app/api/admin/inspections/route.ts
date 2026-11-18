import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  const items = await prisma.inspection.findMany({
    orderBy: { scheduledAt: "desc" },
    take: 200,
    include: {
      property: { select: { title: true, slug: true } },
      customer: { select: { fullName: true, email: true, phone: true } },
      agent: { select: { fullName: true } },
    },
  });
  return json({ items });
});

import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  const items = await prisma.commissionPayout.findMany({
    orderBy: { requestedAt: "desc" },
    take: 200,
    include: { partner: { select: { user: { select: { fullName: true } } } }, _count: { select: { commissions: true } } },
  });
  return json({ items });
});

import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  const items = await prisma.commission.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      partner: { select: { user: { select: { fullName: true } } } },
      transaction: { select: { amount: true, transactionType: true, property: { select: { title: true } } } },
      rule: { select: { name: true } },
    },
  });
  return json({ items });
});

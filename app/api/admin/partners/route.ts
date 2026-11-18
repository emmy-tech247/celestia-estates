import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  const items = await prisma.referralPartner.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      codes: { select: { code: true } },
      _count: { select: { attributions: true, commissions: true } },
    },
  });
  return json({ items });
});

import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async (req) => {
  await requireUser("SUPER_ADMIN");
  const page = Math.max(1, Number(new URL(req.url).searchParams.get("page") ?? 1) || 1);
  const items = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * 50,
    take: 50,
    include: { user: { select: { fullName: true } } },
  });
  return json({ items, page });
});

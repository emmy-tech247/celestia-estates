import prisma from "@/lib/prisma";
import { handle, json, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { transactionCreateSchema } from "@/lib/validation";
import { createTransaction } from "@/lib/transactions";

export const GET = handle(async () => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  const items = await prisma.transaction.findMany({
    orderBy: { transactionDate: "desc" },
    take: 200,
    include: {
      property: { select: { title: true } },
      agent: { select: { fullName: true } },
      payments: { select: { amount: true, status: true } },
      commission: { select: { amount: true, status: true } },
    },
  });
  return json({ items });
});

export const POST = handle(async (req) => {
  const admin = await requireUser("SUPER_ADMIN", "MANAGER");
  const data = transactionCreateSchema.parse(await readJson(req));
  return json(await createTransaction(data, admin.id), 201);
});

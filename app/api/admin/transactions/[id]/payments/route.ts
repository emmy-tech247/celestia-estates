import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { paymentCreateSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";

// Records a payment received outside the gateway (bank transfer, cash, cheque).
export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const data = paymentCreateSchema.parse(await readJson(req));

  const t = await prisma.transaction.findUnique({ where: { id }, select: { status: true } });
  if (!t) throw new ApiError(404, "Transaction not found");
  if (t.status === "COMPLETED" || t.status === "CANCELLED") throw new ApiError(409, `Transaction is ${t.status.toLowerCase()}`);

  const payment = await prisma.payment
    .create({ data: { transactionId: id, amount: data.amount, method: data.method, reference: data.reference, status: "SUCCESSFUL", paidAt: new Date(), recordedById: admin.id } })
    .catch((e) => {
      if (e?.code === "P2002") throw new ApiError(409, "A payment with this reference already exists");
      throw e;
    });
  await audit(admin.id, "payment.record", "payment", payment.id, { transactionId: id.toString(), amount: data.amount });
  return json(payment, 201);
});

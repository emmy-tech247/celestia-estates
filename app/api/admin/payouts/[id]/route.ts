import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { payoutDecisionSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const { action, paymentReference } = payoutDecisionSchema.parse(await readJson(req));

  const payout = await prisma.commissionPayout.findUnique({ where: { id }, include: { partner: { select: { userId: true } } } });
  if (!payout) throw new ApiError(404, "Payout not found");

  const updated = await prisma.$transaction(async (tx) => {
    if (action === "approve") {
      if (payout.status !== "REQUESTED") throw new ApiError(409, "Only requested payouts can be approved");
      return tx.commissionPayout.update({ where: { id }, data: { status: "APPROVED", processedById: admin.id } });
    }
    if (action === "paid") {
      if (payout.status !== "APPROVED") throw new ApiError(409, "Approve the payout before marking it paid");
      if (!paymentReference) throw new ApiError(422, "Enter the bank transfer reference");
      await tx.commission.updateMany({ where: { payoutId: id }, data: { status: "PAID" } });
      return tx.commissionPayout.update({
        where: { id },
        data: { status: "PAID", paymentReference, processedById: admin.id, processedAt: new Date() },
      });
    }
    // reject: release the commissions so they can be requested again
    if (payout.status === "PAID" || payout.status === "REJECTED") throw new ApiError(409, `Payout is already ${payout.status.toLowerCase()}`);
    await tx.commission.updateMany({ where: { payoutId: id }, data: { payoutId: null } });
    return tx.commissionPayout.update({ where: { id }, data: { status: "REJECTED", processedById: admin.id, processedAt: new Date() } });
  });

  await prisma.notification.create({
    data: { userId: payout.partner.userId, title: `Withdrawal ${updated.status.toLowerCase()}`, body: `Amount: ${Number(payout.amount).toLocaleString()}` },
  });
  await audit(admin.id, `payout.${action}`, "commission_payout", id, { amount: Number(payout.amount) });
  return json(updated);
});

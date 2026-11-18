import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { commissionDecisionSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";

// Approval is a deliberate human step: commissions are created PENDING when a transaction completes.
export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const { action, reason } = commissionDecisionSchema.parse(await readJson(req));

  const c = await prisma.commission.findUnique({ where: { id }, include: { partner: { select: { userId: true } } } });
  if (!c) throw new ApiError(404, "Commission not found");
  if (c.status !== "PENDING") throw new ApiError(409, `Commission is already ${c.status.toLowerCase()}`);

  const updated = await prisma.commission.update({
    where: { id },
    data:
      action === "approve"
        ? { status: "APPROVED", approvedById: admin.id, approvedAt: new Date() }
        : { status: "REJECTED", approvedById: admin.id, approvedAt: new Date(), rejectionReason: reason ?? "Rejected by admin" },
  });
  await prisma.notification.create({
    data: { userId: c.partner.userId, title: action === "approve" ? "Commission approved" : "Commission rejected", body: `Amount: ${Number(c.amount).toLocaleString()}` },
  });
  await audit(admin.id, `commission.${action}`, "commission", id, { amount: Number(c.amount) });
  return json(updated);
});

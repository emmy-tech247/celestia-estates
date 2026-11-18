import prisma from "@/lib/prisma";
import { handle, json, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";

// Withdrawal request: bundles every approved, not-yet-paid commission into one payout.
export const POST = handle(async () => {
  const u = await requireUser("REFERRAL_PARTNER");
  const partner = await prisma.referralPartner.findUnique({ where: { userId: u.id } });
  if (!partner || partner.status !== "APPROVED") throw new ApiError(403, "Your partner account is not approved");
  if (!partner.bankName || !partner.accountNumber || !partner.accountName) {
    throw new ApiError(422, "Add your bank details before requesting a withdrawal");
  }
  const minimum = await getSetting<number>("min_payout_amount", 10000);

  const payout = await prisma.$transaction(async (tx) => {
    const eligible = await tx.commission.findMany({ where: { partnerId: partner.id, status: "APPROVED", payoutId: null } });
    const total = eligible.reduce((s, c) => s + Number(c.amount), 0);
    if (total < minimum) throw new ApiError(422, `Minimum withdrawal is ${minimum.toLocaleString()}. Your available balance is ${total.toLocaleString()}.`);

    const created = await tx.commissionPayout.create({
      data: { partnerId: partner.id, amount: total, bankName: partner.bankName, accountNumber: partner.accountNumber, accountName: partner.accountName },
    });
    const claimed = await tx.commission.updateMany({
      where: { id: { in: eligible.map((c) => c.id) }, payoutId: null },
      data: { payoutId: created.id },
    });
    if (claimed.count !== eligible.length) throw new ApiError(409, "Balance changed, please try again");
    return created;
  });
  return json(payout, 201);
});

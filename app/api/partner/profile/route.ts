import prisma from "@/lib/prisma";
import { handle, json, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { partnerProfileSchema } from "@/lib/validation";

// Bank details used for payouts.
export const PATCH = handle(async (req) => {
  const u = await requireUser("REFERRAL_PARTNER");
  const data = partnerProfileSchema.parse(await readJson(req));
  const p = await prisma.referralPartner.update({ where: { userId: u.id }, data });
  return json({ bankName: p.bankName, accountNumber: p.accountNumber, accountName: p.accountName });
});

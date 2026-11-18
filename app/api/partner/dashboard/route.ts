import prisma from "@/lib/prisma";
import { handle, json, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getPartnerOverview } from "@/lib/referrals";

export const GET = handle(async () => {
  const u = await requireUser("REFERRAL_PARTNER");
  const p = await prisma.referralPartner.findUnique({ where: { userId: u.id }, select: { id: true } });
  if (!p) throw new ApiError(404, "Partner profile not found");
  return json(await getPartnerOverview(p.id));
});

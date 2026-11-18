import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { partnerStatusSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const { status } = partnerStatusSchema.parse(await readJson(req));

  const partner = await prisma.referralPartner.findUnique({ where: { id } });
  if (!partner) throw new ApiError(404, "Partner not found");

  const updated = await prisma.referralPartner.update({
    where: { id },
    data: { status, ...(status === "APPROVED" ? { approvedById: admin.id, approvedAt: new Date() } : {}) },
  });
  await prisma.notification.create({
    data: { userId: partner.userId, title: `Referral account ${status.toLowerCase()}`, body: status === "APPROVED" ? "Your referral link is now active." : null },
  });
  await audit(admin.id, `partner.${status.toLowerCase()}`, "referral_partner", id);
  return json(updated);
});

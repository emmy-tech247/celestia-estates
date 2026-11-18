import { randomBytes } from "crypto";
import prisma from "./prisma";
import { absoluteUrl } from "./seo";

/** e.g. "Emmanuel Okafor" -> EMMANU25 (retries until unique). */
export async function generateReferralCode(fullName: string) {
  const letters = fullName.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) || "PARTNR";
  for (let i = 0; i < 20; i++) {
    const code = `${letters}${Math.floor(10 + Math.random() * 90)}`;
    if (!(await prisma.referralCode.findUnique({ where: { code }, select: { id: true } }))) return code;
  }
  return `${letters}${randomBytes(3).toString("hex").toUpperCase()}`;
}

/** Everything the partner dashboard shows. */
export async function getPartnerOverview(partnerId: bigint) {
  const [partner, clicks, attributions, commissionSums, available, payouts, commissions] = await Promise.all([
    prisma.referralPartner.findUniqueOrThrow({ where: { id: partnerId }, include: { codes: { where: { isActive: true } } } }),
    prisma.referralClick.count({ where: { code: { partnerId } } }),
    prisma.referralAttribution.groupBy({ by: ["status"], where: { partnerId }, _count: { _all: true } }),
    prisma.commission.groupBy({ by: ["status"], where: { partnerId }, _sum: { amount: true } }),
    prisma.commission.aggregate({ where: { partnerId, status: "APPROVED", payoutId: null }, _sum: { amount: true } }),
    prisma.commissionPayout.findMany({ where: { partnerId }, orderBy: { requestedAt: "desc" }, take: 20 }),
    prisma.commission.findMany({
      where: { partnerId }, orderBy: { createdAt: "desc" }, take: 20,
      include: { transaction: { select: { property: { select: { title: true } } } } },
    }),
  ]);

  const count = (s: string) => attributions.find((a) => a.status === s)?._count._all ?? 0;
  const sum = (s: string) => Number(commissionSums.find((c) => c.status === s)?._sum.amount ?? 0);
  const referrals = count("PENDING") + count("CONVERTED"); // rejected (duplicates/self-referrals) don't count
  const code = partner.codes[0]?.code ?? null;

  return {
    partner,
    code,
    link: code ? absoluteUrl(`/ref/${code}`) : null,
    clicks,
    referrals,
    purchased: count("CONVERTED"),
    rejected: count("REJECTED"),
    conversionRate: referrals ? Math.round((count("CONVERTED") / referrals) * 1000) / 10 : 0,
    pending: sum("PENDING"),
    approved: sum("APPROVED"),
    paid: sum("PAID"),
    available: Number(available._sum.amount ?? 0),
    payouts,
    commissions,
  };
}

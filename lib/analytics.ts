import prisma from "./prisma";

/** Conversion funnel for the last `days` days. */
export async function getFunnel(days = 30) {
  const since = new Date(Date.now() - days * 86_400_000);
  const [sessions, propertyViews, leads, referralLeads, inspections, wonLeads, referralSales, topRaw] = await Promise.all([
    prisma.analyticsEvent.groupBy({ by: ["sessionId"], where: { type: "PAGE_VIEW", createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { type: "PROPERTY_VIEW", createdAt: { gte: since } } }),
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.lead.count({ where: { createdAt: { gte: since }, source: "REFERRAL" } }),
    prisma.inspection.count({ where: { createdAt: { gte: since } } }),
    prisma.lead.count({ where: { createdAt: { gte: since }, stage: "WON" } }),
    prisma.referralAttribution.count({ where: { status: "CONVERTED", updatedAt: { gte: since } } }),
    prisma.analyticsEvent.groupBy({
      by: ["propertyId"],
      where: { type: "PROPERTY_VIEW", propertyId: { not: null }, createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { propertyId: "desc" } },
      take: 5,
    }),
  ]);

  const ids = topRaw.map((r) => r.propertyId).filter((x): x is bigint => x !== null);
  const props = await prisma.property.findMany({ where: { id: { in: ids } }, select: { id: true, title: true } });
  const topProperties = topRaw.map((r) => ({
    propertyId: r.propertyId, views: r._count._all, title: props.find((p) => p.id === r.propertyId)?.title ?? "Removed property",
  }));

  return {
    days,
    visitors: sessions.length,
    propertyViews,
    leads,
    referralLeads,
    inspections,
    sales: wonLeads,
    referralSales,
    conversionRate: leads ? Math.round((wonLeads / leads) * 1000) / 10 : 0,
    topProperties,
  };
}

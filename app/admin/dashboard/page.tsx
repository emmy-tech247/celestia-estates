import Link from "next/link";
import prisma from "@/lib/prisma";
import Stat from "@/components/ui/Stat";
import Badge from "@/components/ui/Badge";
import { formatPrice, listingLabel } from "@/lib/format";
import { placeName } from "@/lib/locations";

export default async function AdminDashboard() {
  const [total, active, leads, newLeads, pending, partners, pendingCommissions, recent] = await Promise.all([
    prisma.property.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.property.count({ where: { status: "PUBLISHED" } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { stage: "NEW" } }),
    prisma.inspection.count({ where: { status: "PENDING" } }),
    prisma.referralPartner.count({ where: { status: "PENDING" } }),
    prisma.commission.count({ where: { status: "PENDING" } }),
    prisma.property.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { location: true } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total properties" value={total} />
        <Stat label="Active listings" value={active} />
        <Stat label="Leads" value={leads} />
        <Stat label="New leads to contact" value={newLeads} />
        <Stat label="Pending inspections" value={pending} />
        <Stat label="Partners awaiting approval" value={partners} />
        <Stat label="Commissions to review" value={pendingCommissions} />
      </div>

      <section className="card">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="font-semibold text-brand">Recent property listings</h2>
          <Link href="/admin/properties/new" className="btn">Add property</Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No properties yet. Add your first listing.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((p) => (
              <li key={p.id.toString()} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                <div><p className="font-medium">{p.title}</p><p className="text-slate-500">{placeName(p.location)}</p></div>
                <div className="flex items-center gap-3">
                  <span>{formatPrice(p.price, p.currency, p.listingType)} · {listingLabel(p.listingType)}</span>
                  <Badge value={p.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

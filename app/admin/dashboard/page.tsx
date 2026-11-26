import Link from "next/link";
import prisma from "@/lib/prisma";
import Stat from "@/components/ui/Stat";
import Badge from "@/components/ui/Badge";
import { formatPrice, listingLabel } from "@/lib/format";
import { placeName } from "@/lib/locations";

export default async function AdminDashboard() {
  const since = new Date(); since.setMonth(since.getMonth() - 11, 1); since.setHours(0, 0, 0, 0);
  const [total, active, leads, newLeads, pending, partners, pendingCommissions, recent, leadDates, listingDates, recentLeads] = await Promise.all([
    prisma.property.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.property.count({ where: { status: "PUBLISHED" } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { stage: "NEW" } }),
    prisma.inspection.count({ where: { status: "PENDING" } }),
    prisma.referralPartner.count({ where: { status: "PENDING" } }),
    prisma.commission.count({ where: { status: "PENDING" } }),
    prisma.property.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { location: true } }),
    prisma.lead.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.property.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, stage: true, createdAt: true } }),
  ]);

  // Real data for the chart: leads received and listings added, per month, last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(since); d.setMonth(since.getMonth() + i);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en", { month: "short" }), leads: 0, listings: 0 };
  });
  const bump = (dates: { createdAt: Date }[], field: "leads" | "listings") => {
    for (const r of dates) {
      const m = months.find((x) => x.key === `${r.createdAt.getFullYear()}-${r.createdAt.getMonth()}`);
      if (m) m[field]++;
    }
  };
  bump(leadDates, "leads");
  bump(listingDates, "listings");
  const peak = Math.max(1, ...months.map((m) => Math.max(m.leads, m.listings)));
  const ago = (d: Date) => {
    const mins = Math.max(1, Math.round((Date.now() - d.getTime()) / 60000));
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
    return `${Math.round(mins / 1440)}d ago`;
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total properties" value={total} tone="plum" />
        <Stat label="Active listings" value={active} tone="green" />
        <Stat label="Leads" value={leads} tone="gold" />
        <Stat label="New leads to contact" value={newLeads} tone="ember" />
        <Stat label="Pending inspections" value={pending} tone="ember" />
        <Stat label="Partners awaiting approval" value={partners} tone="plum" />
        <Stat label="Commissions to review" value={pendingCommissions} tone="gold" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-brand">Growth</h2>
              <p className="text-xs text-slate-500">Leads received and listings added, last 12 months</p>
            </div>
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-ember" />Leads</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-plum" />Listings added</span>
            </div>
          </div>
          <div className="mt-6 flex h-56 items-end gap-2" role="img" aria-label="Leads received and listings added per month">
            {months.map((m) => (
              <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${m.label}: ${m.leads} leads, ${m.listings} listings`}>
                <div className="flex h-full w-full items-end justify-center gap-0.5">
                  <div className="w-1/2 max-w-3 rounded-t bg-gradient-to-t from-ember/30 to-ember" style={{ height: `${Math.max(3, (m.leads / peak) * 100)}%`, opacity: m.leads ? 1 : 0.2 }} />
                  <div className="w-1/2 max-w-3 rounded-t bg-gradient-to-t from-plum/30 to-plum" style={{ height: `${Math.max(3, (m.listings / peak) * 100)}%`, opacity: m.listings ? 1 : 0.2 }} />
                </div>
                <span className="text-[10px] text-slate-500">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <h2 className="font-semibold text-brand">Latest leads</h2>
            <Link href="/admin/leads" className="text-xs font-semibold text-gold-dark hover:underline">View all</Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No leads yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentLeads.map((l) => (
                <li key={l.id.toString()}>
                  <Link href={`/admin/leads/${l.id}`} className="flex items-center gap-3 p-4 text-sm transition hover:bg-canvas">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-plum/10 text-xs font-semibold text-plum">{l.name.slice(0, 1).toUpperCase()}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-medium">{l.name}</span><span className="text-xs text-slate-400">{ago(l.createdAt)}</span></span>
                    <Badge value={l.stage} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
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

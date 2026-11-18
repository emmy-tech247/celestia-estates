import Link from "next/link";
import { getFunnel } from "@/lib/analytics";
import Stat from "@/components/ui/Stat";

export default async function Analytics({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const raw = Number((await searchParams).days);
  const days = [7, 30, 90, 365].includes(raw) ? raw : 30;
  const f = await getFunnel(days);

  const steps = [
    ["Visitors", f.visitors], ["Property views", f.propertyViews], ["Leads", f.leads], ["Inspections booked", f.inspections], ["Sales", f.sales],
  ] as const;
  const max = Math.max(1, ...steps.map((s) => s[1]));

  return (
    <div className="space-y-8">
      <div className="flex gap-2 text-sm">
        {[7, 30, 90, 365].map((d) => (
          <Link key={d} href={`/admin/analytics?days=${d}`} className={`rounded-full px-3 py-1 ${d === days ? "bg-brand text-white" : "bg-white"}`}>Last {d} days</Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Lead → sale conversion" value={`${f.conversionRate}%`} />
        <Stat label="Referral leads" value={f.referralLeads} />
        <Stat label="Referral sales" value={f.referralSales} />
        <Stat label="Leads per 100 visitors" value={f.visitors ? Math.round((f.leads / f.visitors) * 1000) / 10 : 0} />
      </div>

      <section className="card p-5">
        <h2 className="mb-4 font-semibold text-brand">Conversion funnel</h2>
        <div className="space-y-3">
          {steps.map(([label, n]) => (
            <div key={label}>
              <div className="flex justify-between text-sm"><span>{label}</span><span className="font-semibold">{n}</span></div>
              <div className="mt-1 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-gold" style={{ width: `${Math.max(2, (n / max) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">Visitors are unique browsers with at least one page view. Bots are excluded.</p>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold text-brand">Most viewed properties</h2>
        {f.topProperties.length === 0 ? <p className="text-sm text-slate-500">No views recorded yet.</p> : (
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {f.topProperties.map((p) => <li key={String(p.propertyId)}>{p.title} <span className="text-slate-400">· {p.views} views</span></li>)}
          </ol>
        )}
      </section>
    </div>
  );
}

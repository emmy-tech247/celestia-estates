import prisma from "@/lib/prisma";
import { requirePageRole } from "@/lib/auth";
import Stat from "@/components/ui/Stat";
import Badge from "@/components/ui/Badge";
import { formatDate, formatPrice } from "@/lib/format";

export default async function AgentDashboard() {
  const user = await requirePageRole(["AGENT"]);
  const [properties, newLeads, openLeads, inspections, list] = await Promise.all([
    prisma.property.count({ where: { agentId: user.id, status: { not: "ARCHIVED" } } }),
    prisma.lead.count({ where: { assignedAgentId: user.id, stage: "NEW" } }),
    prisma.lead.count({ where: { assignedAgentId: user.id, stage: { notIn: ["WON", "LOST"] } } }),
    prisma.inspection.findMany({
      where: { agentId: user.id, status: { in: ["PENDING", "APPROVED", "RESCHEDULED"] }, scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: "asc" }, take: 5,
      include: { property: { select: { title: true } }, customer: { select: { fullName: true, phone: true } } },
    }),
    prisma.property.findMany({ where: { agentId: user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Assigned properties" value={properties} />
        <Stat label="New leads to contact" value={newLeads} />
        <Stat label="Open leads" value={openLeads} />
        <Stat label="Upcoming inspections" value={inspections.length} />
      </div>

      <section className="card p-4">
        <h2 className="mb-3 font-semibold text-brand">Upcoming inspections</h2>
        {inspections.length === 0 ? <p className="text-sm text-slate-500">Nothing scheduled.</p> : (
          <ul className="divide-y divide-slate-100 text-sm">
            {inspections.map((a) => (
              <li key={a.id.toString()} className="flex justify-between py-2">
                <span>{a.property.title} · {a.customer?.fullName} {a.customer?.phone && `(${a.customer.phone})`}</span>
                <span className="text-slate-500">{formatDate(a.scheduledAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-4">
        <h2 className="mb-3 font-semibold text-brand">My properties</h2>
        {list.length === 0 ? <p className="text-sm text-slate-500">No properties assigned to you yet.</p> : (
          <ul className="divide-y divide-slate-100 text-sm">
            {list.map((p) => (
              <li key={p.id.toString()} className="flex items-center justify-between py-2">
                <span>{p.title}</span>
                <span className="flex items-center gap-3">{formatPrice(p.price, p.currency, p.listingType)} <Badge value={p.status} /></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

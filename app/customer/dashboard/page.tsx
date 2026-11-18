import prisma from "@/lib/prisma";
import { requirePageRole } from "@/lib/auth";
import Stat from "@/components/ui/Stat";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";

export default async function CustomerDashboard() {
  const user = await requirePageRole(["CUSTOMER"]);
  const [favorites, inspections, leads] = await Promise.all([
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.inspection.count({ where: { customerId: user.id } }),
    prisma.lead.findMany({
      where: { customerId: user.id }, orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, stage: true, createdAt: true, property: { select: { title: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <p className="text-slate-600">Welcome back, {user.fullName.split(" ")[0]}.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Saved properties" value={favorites} />
        <Stat label="Inspection bookings" value={inspections} />
        <Stat label="Enquiries sent" value={leads.length} />
      </div>
      <section className="card p-4">
        <h2 className="mb-3 font-semibold text-brand">Your enquiries</h2>
        {leads.length === 0 ? <p className="text-sm text-slate-500">You haven&apos;t sent any enquiries yet.</p> : (
          <ul className="divide-y divide-slate-100 text-sm">
            {leads.map((l) => (
              <li key={l.id.toString()} className="flex items-center justify-between py-2">
                <span>{l.property?.title ?? "General enquiry"} <span className="text-xs text-slate-400">· {formatDate(l.createdAt)}</span></span>
                <Badge value={l.stage} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

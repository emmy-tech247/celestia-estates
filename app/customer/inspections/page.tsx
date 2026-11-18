import prisma from "@/lib/prisma";
import { requirePageRole } from "@/lib/auth";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";

export default async function CustomerInspections() {
  const user = await requirePageRole(["CUSTOMER"]);
  const items = await prisma.inspection.findMany({
    where: { customerId: user.id }, orderBy: { scheduledAt: "desc" },
    include: { property: { select: { title: true } }, agent: { select: { fullName: true, phone: true } } },
  });
  return (
    <div className="card divide-y divide-slate-100">
      {items.length === 0 && <p className="p-8 text-center text-slate-500">You have no inspection bookings.</p>}
      {items.map((a) => (
        <div key={a.id.toString()} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
          <div>
            <p className="font-medium">{a.property.title}</p>
            <p className="text-slate-500">{formatDate(a.scheduledAt)}{a.agent && ` · Agent: ${a.agent.fullName}${a.agent.phone ? ` (${a.agent.phone})` : ""}`}</p>
          </div>
          <Badge value={a.status} />
        </div>
      ))}
    </div>
  );
}

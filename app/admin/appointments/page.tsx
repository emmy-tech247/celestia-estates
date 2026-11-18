import { prisma } from "@/lib/prisma";
import StatusSelect from "@/components/admin/StatusSelect";
import { formatDate } from "@/lib/format";

export default async function AdminAppointments() {
  const items = await prisma.appointment.findMany({
    orderBy: { appointmentDate: "desc" },
    take: 200,
    include: {
      property: { select: { title: true } },
      customer: { select: { fullName: true, phone: true } },
      agent: { select: { fullName: true } },
    },
  });

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
          <tr><th className="p-3">When</th><th>Property</th><th>Customer</th><th>Agent</th><th className="pr-3">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((a) => (
            <tr key={a.id.toString()}>
              <td className="whitespace-nowrap p-3">{formatDate(a.appointmentDate)}</td>
              <td>{a.property.title}</td>
              <td>{a.customer.fullName}<br /><span className="text-xs text-slate-500">{a.customer.phone}</span></td>
              <td>{a.agent.fullName}</td>
              <td className="pr-3"><StatusSelect endpoint="/api/admin/appointments" id={a.id.toString()} value={a.status} options={["PENDING", "APPROVED", "RESCHEDULED", "COMPLETED", "CANCELLED"]} /></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No inspection bookings yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

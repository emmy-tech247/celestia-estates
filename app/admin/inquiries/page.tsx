import { prisma } from "@/lib/prisma";
import StatusSelect from "@/components/admin/StatusSelect";
import { formatDate } from "@/lib/format";

export default async function AdminInquiries() {
  const items = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { property: { select: { title: true } }, assignedAgent: { select: { fullName: true } } },
  });

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
          <tr><th className="p-3">From</th><th>Property</th><th>Message</th><th>Agent</th><th>Received</th><th className="pr-3">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100 align-top">
          {items.map((i) => (
            <tr key={i.id.toString()}>
              <td className="p-3"><p className="font-medium">{i.name}</p><p className="text-xs text-slate-500">{i.email}<br />{i.phone}</p></td>
              <td>{i.property.title}</td>
              <td className="max-w-xs text-slate-600">{i.message}</td>
              <td>{i.assignedAgent?.fullName ?? <span className="text-slate-400">Unassigned</span>}</td>
              <td className="whitespace-nowrap text-xs">{formatDate(i.createdAt)}</td>
              <td className="pr-3"><StatusSelect endpoint="/api/admin/inquiries" id={i.id.toString()} value={i.status} options={["NEW", "CONTACTED", "QUALIFIED", "CLOSED"]} /></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No enquiries yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

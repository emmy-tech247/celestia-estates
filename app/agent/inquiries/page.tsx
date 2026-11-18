import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/auth";
import StatusSelect from "@/components/admin/StatusSelect";
import { formatDate } from "@/lib/format";

export default async function AgentInquiries() {
  const user = await requirePageRole(["AGENT"]);
  const items = await prisma.inquiry.findMany({
    where: { assignedAgentId: user.id },
    orderBy: { createdAt: "desc" },
    include: { property: { select: { title: true } } },
  });

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
          <tr><th className="p-3">From</th><th>Property</th><th>Message</th><th>Received</th><th className="pr-3">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100 align-top">
          {items.map((i) => (
            <tr key={i.id.toString()}>
              <td className="p-3"><p className="font-medium">{i.name}</p><p className="text-xs text-slate-500">{i.email}<br />{i.phone}</p></td>
              <td>{i.property.title}</td>
              <td className="max-w-xs text-slate-600">{i.message}</td>
              <td className="whitespace-nowrap text-xs">{formatDate(i.createdAt)}</td>
              <td className="pr-3"><StatusSelect endpoint="/api/agent/inquiries" id={i.id.toString()} value={i.status} options={["NEW", "CONTACTED", "QUALIFIED", "CLOSED"]} /></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No enquiries assigned to you.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

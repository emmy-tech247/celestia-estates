import prisma from "@/lib/prisma";
import { requirePageRole } from "@/lib/auth";
import StatusSelect from "@/components/admin/StatusSelect";
import NoteForm from "@/components/admin/NoteForm";
import { formatDate } from "@/lib/format";
import { STAGES } from "@/lib/validation";

export default async function AgentLeads() {
  const user = await requirePageRole(["AGENT"]);
  const items = await prisma.lead.findMany({
    where: { assignedAgentId: user.id },
    orderBy: [{ createdAt: "desc" }],
    include: { property: { select: { title: true } }, activities: { orderBy: { createdAt: "desc" }, take: 3, include: { user: { select: { fullName: true } } } } },
  });

  return (
    <div className="space-y-4">
      {items.length === 0 && <p className="card p-8 text-center text-slate-500">No leads assigned to you.</p>}
      {items.map((l) => (
        <div key={l.id.toString()} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{l.name}</p>
              <p className="text-sm text-slate-500">{l.email}{l.phone && ` · ${l.phone}`}</p>
              <p className="mt-1 text-sm">{l.property?.title ?? "General enquiry"} <span className="text-xs text-slate-400">· {formatDate(l.createdAt)}</span></p>
            </div>
            <StatusSelect endpoint="/api/agent/leads" id={l.id.toString()} field="stage" value={l.stage} options={[...STAGES]} disabled={l.stage === "WON"} />
          </div>
          {l.message && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">{l.message}</p>}
          {l.activities.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              {l.activities.map((a) => <li key={a.id.toString()}>{formatDate(a.createdAt)} · {a.type.toLowerCase().replace(/_/g, " ")}{a.body && `: ${a.body}`}</li>)}
            </ul>
          )}
          <div className="mt-3"><NoteForm endpoint={`/api/agent/leads/${l.id}/activities`} /></div>
        </div>
      ))}
    </div>
  );
}

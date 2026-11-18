import Link from "next/link";
import prisma from "@/lib/prisma";
import StatusSelect from "@/components/admin/StatusSelect";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { STAGES } from "@/lib/validation";

export default async function AdminLeads({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const { stage } = await searchParams;
  const valid = ["NEW", "CONTACTED", "INSPECTION_SCHEDULED", "NEGOTIATION", "PAYMENT_PROCESSING", "WON", "LOST"];
  const filter = stage && valid.includes(stage) ? (stage as "NEW") : undefined;

  const [items, agents] = await Promise.all([
    prisma.lead.findMany({
      where: filter ? { stage: filter } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        property: { select: { title: true } },
        attribution: { select: { status: true, partner: { select: { user: { select: { fullName: true } } } } } },
      },
    }),
    prisma.user.findMany({ where: { role: { name: "AGENT" }, status: "ACTIVE" }, select: { id: true, fullName: true }, orderBy: { fullName: "asc" } }),
  ]);
  const agentOptions = [{ value: "", label: "Unassigned" }, ...agents.map((a) => ({ value: a.id.toString(), label: a.fullName }))];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/leads" className={`rounded-full px-3 py-1 ${!filter ? "bg-brand text-white" : "bg-white"}`}>All</Link>
        {valid.map((s) => (
          <Link key={s} href={`/admin/leads?stage=${s}`} className={`rounded-full px-3 py-1 ${filter === s ? "bg-brand text-white" : "bg-white"}`}>{s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ")}</Link>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
            <tr><th className="p-3">Lead</th><th>Property</th><th>Source</th><th>Agent</th><th>Received</th><th className="pr-3">Stage</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 align-top">
            {items.map((l) => (
              <tr key={l.id.toString()}>
                <td className="p-3">
                  <Link href={`/admin/leads/${l.id}`} className="font-medium text-brand hover:text-gold">{l.name}</Link>
                  <p className="text-xs text-slate-500">{l.email}<br />{l.phone}</p>
                </td>
                <td>{l.property?.title ?? "-"}<br /><span className="text-xs text-slate-400">{l.type.toLowerCase().replace(/_/g, " ")}</span></td>
                <td>
                  <Badge value={l.source} />
                  {l.attribution && <p className="mt-1 text-xs text-slate-500">{l.attribution.partner.user.fullName} · {l.attribution.status.toLowerCase()}</p>}
                </td>
                <td><StatusSelect endpoint="/api/admin/leads" id={l.id.toString()} field="assignedAgentId" value={l.assignedAgentId?.toString() ?? ""} options={agentOptions} /></td>
                <td className="whitespace-nowrap text-xs">{formatDate(l.createdAt)}</td>
                <td className="pr-3"><StatusSelect endpoint="/api/admin/leads" id={l.id.toString()} field="stage" value={l.stage} options={[...STAGES]} disabled={l.stage === "WON"} /></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No leads here.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

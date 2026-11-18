import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import NoteForm from "@/components/admin/NoteForm";
import { formatDate, formatPrice } from "@/lib/format";

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const lead = await prisma.lead.findUnique({
    where: { id: BigInt(id) },
    include: {
      property: { select: { title: true, slug: true, price: true, currency: true, listingType: true } },
      assignedAgent: { select: { fullName: true } },
      activities: { orderBy: { createdAt: "desc" }, include: { user: { select: { fullName: true } } } },
      inspections: { orderBy: { scheduledAt: "desc" } },
      attribution: { include: { partner: { include: { user: { select: { fullName: true } } } } } },
    },
  });
  if (!lead) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-brand">{lead.name}</h2>
            <Badge value={lead.stage} />
          </div>
          <p className="mt-1 text-sm text-slate-600">{lead.email} {lead.phone && `· ${lead.phone}`}</p>
          {lead.message && <p className="mt-4 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm">{lead.message}</p>}
          {lead.lostReason && <p className="mt-3 text-sm text-red-600">Lost: {lead.lostReason}</p>}
        </section>

        <section className="card p-5">
          <h3 className="mb-3 font-semibold text-brand">Timeline</h3>
          <NoteForm endpoint={`/api/admin/leads/${lead.id}/activities`} />
          <ul className="mt-4 space-y-3 text-sm">
            {lead.activities.map((a) => (
              <li key={a.id.toString()} className="border-l-2 border-slate-200 pl-3">
                <p><span className="font-medium">{a.type.toLowerCase().replace(/_/g, " ")}</span>{a.body && <>: {a.body}</>}</p>
                <p className="text-xs text-slate-400">{formatDate(a.createdAt)}{a.user && ` · ${a.user.fullName}`}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-4 text-sm">
        <section className="card space-y-1 p-5">
          <h3 className="mb-2 font-semibold text-brand">Details</h3>
          <p><span className="text-slate-500">Type:</span> {lead.type.toLowerCase().replace(/_/g, " ")}</p>
          <p><span className="text-slate-500">Source:</span> {lead.source.toLowerCase()}</p>
          <p><span className="text-slate-500">Agent:</span> {lead.assignedAgent?.fullName ?? "Unassigned"}</p>
          <p><span className="text-slate-500">Created:</span> {formatDate(lead.createdAt)}</p>
          {lead.utmCampaign && <p><span className="text-slate-500">Campaign:</span> {lead.utmCampaign}</p>}
        </section>
        {lead.property && (
          <section className="card p-5">
            <h3 className="mb-2 font-semibold text-brand">Property</h3>
            <Link href={`/properties/${lead.property.slug}`} className="text-gold underline">{lead.property.title}</Link>
            <p className="text-slate-600">{formatPrice(lead.property.price, lead.property.currency, lead.property.listingType)}</p>
          </section>
        )}
        {lead.attribution && (
          <section className="card p-5">
            <h3 className="mb-2 font-semibold text-brand">Referral</h3>
            <p>{lead.attribution.partner.user.fullName}</p>
            <Badge value={lead.attribution.status} />
            {lead.attribution.rejectionReason && <p className="mt-1 text-xs text-slate-500">{lead.attribution.rejectionReason}</p>}
          </section>
        )}
        {lead.inspections.length > 0 && (
          <section className="card p-5">
            <h3 className="mb-2 font-semibold text-brand">Inspections</h3>
            {lead.inspections.map((i) => <p key={i.id.toString()}>{formatDate(i.scheduledAt)} <Badge value={i.status} /></p>)}
          </section>
        )}
      </aside>
    </div>
  );
}

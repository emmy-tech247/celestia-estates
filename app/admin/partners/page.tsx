import prisma from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import ActionButton from "@/components/admin/ActionButton";
import { formatDate } from "@/lib/format";

export default async function AdminPartners() {
  const items = await prisma.referralPartner.findMany({
    orderBy: { createdAt: "desc" }, take: 200,
    include: { user: { select: { fullName: true, email: true, phone: true } }, codes: { select: { code: true } }, _count: { select: { attributions: true, commissions: true } } },
  });
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
          <tr><th className="p-3">Partner</th><th>Code</th><th>Referrals</th><th>Commissions</th><th>Joined</th><th>Status</th><th className="pr-3">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((p) => {
            const url = `/api/admin/partners/${p.id}`;
            return (
              <tr key={p.id.toString()}>
                <td className="p-3"><p className="font-medium">{p.user.fullName}</p><p className="text-xs text-slate-500">{p.user.email}<br />{p.user.phone}</p></td>
                <td className="font-mono text-xs">{p.codes.map((c) => c.code).join(", ")}</td>
                <td>{p._count.attributions}</td>
                <td>{p._count.commissions}</td>
                <td className="whitespace-nowrap text-xs">{formatDate(p.createdAt)}</td>
                <td><Badge value={p.status} /></td>
                <td className="pr-3">
                  <div className="flex gap-2">
                    {p.status !== "APPROVED" && <ActionButton url={url} method="PATCH" body={{ status: "APPROVED" }} label="Approve" tone="primary" />}
                    {p.status === "APPROVED" && <ActionButton url={url} method="PATCH" body={{ status: "SUSPENDED" }} label="Suspend" tone="danger" confirmText="Suspend this partner? Their link stops working." />}
                    {p.status === "PENDING" && <ActionButton url={url} method="PATCH" body={{ status: "REJECTED" }} label="Reject" tone="danger" />}
                  </div>
                </td>
              </tr>
            );
          })}
          {items.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-500">No referral partners yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Badge from "@/components/ui/Badge";
import ActionButton from "@/components/admin/ActionButton";
import CommissionRuleForm from "@/components/admin/CommissionRuleForm";
import { formatDate, formatPrice } from "@/lib/format";

export default async function AdminCommissions() {
  const me = await getCurrentUser();
  const [commissions, payouts, rules] = await Promise.all([
    prisma.commission.findMany({
      orderBy: { createdAt: "desc" }, take: 100,
      include: { partner: { select: { user: { select: { fullName: true } } } }, transaction: { select: { amount: true, property: { select: { title: true } } } }, rule: { select: { name: true } } },
    }),
    prisma.commissionPayout.findMany({ orderBy: { requestedAt: "desc" }, take: 100, include: { partner: { select: { user: { select: { fullName: true } } } } } }),
    prisma.commissionRule.findMany({ orderBy: [{ priority: "desc" }, { id: "asc" }] }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-brand">Commissions</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
              <tr><th className="p-3">Partner</th><th>Deal</th><th>Rule</th><th>Reward</th><th>Status</th><th className="pr-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commissions.map((c) => (
                <tr key={c.id.toString()}>
                  <td className="p-3 font-medium">{c.partner.user.fullName}</td>
                  <td>{c.transaction.property.title}<br /><span className="text-xs text-slate-500">{formatPrice(c.transaction.amount)}</span></td>
                  <td className="text-xs text-slate-500">{c.rule?.name ?? "-"}</td>
                  <td className="font-semibold">{formatPrice(c.amount)}</td>
                  <td><Badge value={c.status} /></td>
                  <td className="pr-3">
                    {c.status === "PENDING" && (
                      <div className="flex gap-2">
                        <ActionButton url={`/api/admin/commissions/${c.id}`} method="PATCH" body={{ action: "approve" }} label="Approve" tone="primary" confirmText="Approve this commission? Only do so after the sale is verified and paid." />
                        <ActionButton url={`/api/admin/commissions/${c.id}`} method="PATCH" body={{ action: "reject" }} label="Reject" tone="danger" prompt={{ key: "reason", message: "Reason for rejection:" }} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {commissions.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No commissions yet. They appear when a referred lead&apos;s transaction completes.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-brand">Withdrawal requests</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
              <tr><th className="p-3">Partner</th><th>Amount</th><th>Bank</th><th>Requested</th><th>Status</th><th className="pr-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((p) => (
                <tr key={p.id.toString()}>
                  <td className="p-3 font-medium">{p.partner.user.fullName}</td>
                  <td className="font-semibold">{formatPrice(p.amount)}</td>
                  <td className="text-xs">{p.bankName}<br />{p.accountNumber} · {p.accountName}</td>
                  <td className="whitespace-nowrap text-xs">{formatDate(p.requestedAt)}</td>
                  <td><Badge value={p.status} />{p.paymentReference && <p className="mt-1 text-xs text-slate-500">Ref: {p.paymentReference}</p>}</td>
                  <td className="pr-3">
                    <div className="flex gap-2">
                      {p.status === "REQUESTED" && <ActionButton url={`/api/admin/payouts/${p.id}`} method="PATCH" body={{ action: "approve" }} label="Approve" tone="primary" />}
                      {p.status === "APPROVED" && <ActionButton url={`/api/admin/payouts/${p.id}`} method="PATCH" body={{ action: "paid" }} label="Mark paid" tone="primary" prompt={{ key: "paymentReference", message: "Bank transfer reference:" }} />}
                      {(p.status === "REQUESTED" || p.status === "APPROVED") && <ActionButton url={`/api/admin/payouts/${p.id}`} method="PATCH" body={{ action: "reject" }} label="Reject" tone="danger" confirmText="Reject and release these commissions?" />}
                    </div>
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No withdrawal requests.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-brand">Commission rules</h2>
        <p className="text-sm text-slate-500">The highest-priority active rule that matches a completed transaction decides the reward. The seeded rules are placeholders. Set your own policy.</p>
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
              <tr><th className="p-3">Rule</th><th>Applies to</th><th>Reward</th><th>Priority</th><th className="pr-3">Active</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((r) => (
                <tr key={r.id.toString()}>
                  <td className="p-3 font-medium">{r.name}</td>
                  <td>{r.transactionType?.toLowerCase() ?? "any"}{r.minPropertyValue || r.maxPropertyValue ? ` · ${r.minPropertyValue ?? 0}-${r.maxPropertyValue ?? "∞"}` : ""}</td>
                  <td>
                    {r.calcType !== "PERCENTAGE" && formatPrice(r.fixedAmount ?? 0)}
                    {r.calcType === "BOTH" && " + "}
                    {r.calcType !== "FIXED" && `${Number(r.percentage)}% of ${r.base === "AGENCY_COMMISSION" ? "agency commission" : "property value"}`}
                  </td>
                  <td>{r.priority}</td>
                  <td className="pr-3">
                    {me?.role.name === "SUPER_ADMIN"
                      ? <ActionButton url={`/api/admin/commission-rules/${r.id}`} method="PATCH" body={{ isActive: !r.isActive }} label={r.isActive ? "Active · disable" : "Disabled · enable"} />
                      : <Badge value={r.isActive ? "ACTIVE" : "SUSPENDED"} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {me?.role.name === "SUPER_ADMIN" && <CommissionRuleForm />}
      </section>
    </div>
  );
}

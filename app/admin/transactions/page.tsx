import prisma from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import ActionButton from "@/components/admin/ActionButton";
import TransactionForm from "@/components/admin/TransactionForm";
import { formatPrice } from "@/lib/format";

export default async function AdminTransactions() {
  const [items, leads] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { transactionDate: "desc" }, take: 200,
      include: { property: { select: { title: true } }, payments: { where: { status: "SUCCESSFUL" }, select: { amount: true } }, commission: { select: { amount: true, status: true } } },
    }),
    prisma.lead.findMany({
      where: { stage: { in: ["INSPECTION_SCHEDULED", "NEGOTIATION"] }, propertyId: { not: null } },
      orderBy: { createdAt: "desc" }, take: 100,
      select: { id: true, name: true, property: { select: { title: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <TransactionForm leads={leads.map((l) => ({ id: l.id.toString(), label: `${l.name} · ${l.property?.title ?? ""}` }))} />
      <p className="text-sm text-slate-500">
        A property only becomes sold or rented when its transaction is completed, and completion requires payments received to cover the full amount.
      </p>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
            <tr><th className="p-3">Property / buyer</th><th>Type</th><th>Amount</th><th>Received</th><th>Referral reward</th><th>Status</th><th className="pr-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((t) => {
              const paid = t.payments.reduce((s, p) => s + Number(p.amount), 0);
              const open = t.status === "PENDING" || t.status === "APPROVED";
              const id = t.id.toString();
              return (
                <tr key={id}>
                  <td className="p-3"><p className="font-medium">{t.property.title}</p><p className="text-xs text-slate-500">{t.buyerName}</p></td>
                  <td>{t.transactionType.toLowerCase()}</td>
                  <td>{formatPrice(t.amount, t.currency)}</td>
                  <td>{formatPrice(paid, t.currency)}</td>
                  <td>{t.commission ? <>{formatPrice(t.commission.amount, t.currency)} <Badge value={t.commission.status} /></> : "-"}</td>
                  <td><Badge value={t.status} /></td>
                  <td className="pr-3">
                    {open && (
                      <div className="flex flex-wrap gap-2">
                        <ActionButton url={`/api/admin/transactions/${id}/payments`} label="Record payment" body={{ method: "bank_transfer" }} prompt={{ key: "amount", message: "Amount received (₦):" }} />
                        <ActionButton url={`/api/admin/transactions/${id}/complete`} label="Complete" tone="primary" confirmText="Complete this transaction? The property will be marked sold/rented." prompt={{ key: "agencyCommission", message: "Agency commission earned on this deal (₦). Leave blank if not needed:", optional: true }} />
                        <ActionButton url={`/api/admin/transactions/${id}`} method="DELETE" label="Cancel" tone="danger" confirmText="Cancel this transaction?" />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-500">No transactions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

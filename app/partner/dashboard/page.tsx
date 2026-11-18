import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requirePageRole } from "@/lib/auth";
import { getPartnerOverview } from "@/lib/referrals";
import { getSetting } from "@/lib/settings";
import Stat from "@/components/ui/Stat";
import Badge from "@/components/ui/Badge";
import CopyLink from "@/components/partner/CopyLink";
import BankForm from "@/components/partner/BankForm";
import ActionButton from "@/components/admin/ActionButton";
import { formatDate, formatPrice } from "@/lib/format";

export default async function PartnerDashboard() {
  const user = await requirePageRole(["REFERRAL_PARTNER"]);
  const p = await prisma.referralPartner.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!p) redirect("/");

  const [o, minimum] = await Promise.all([getPartnerOverview(p.id), getSetting<number>("min_payout_amount", 10000)]);
  const approved = o.partner.status === "APPROVED";
  const hasBank = !!(o.partner.bankName && o.partner.accountNumber && o.partner.accountName);

  return (
    <div className="space-y-8">
      {!approved && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Your partner account is <strong>{o.partner.status.toLowerCase()}</strong>. Your link starts working as soon as an administrator approves it.
        </p>
      )}

      <section className="card space-y-3 p-5">
        <h2 className="font-semibold text-brand">Your referral link</h2>
        {o.link ? <CopyLink link={o.link} /> : <p className="text-sm text-slate-500">No active code.</p>}
        <p className="text-xs text-slate-500">Add <code>?to=/properties/some-property</code> to the link to send people straight to a listing.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Link clicks" value={o.clicks} />
        <Stat label="Referrals (enquiries)" value={o.referrals} />
        <Stat label="Completed purchases" value={o.purchased} />
        <Stat label="Conversion rate" value={`${o.conversionRate}%`} />
        <Stat label="Pending commission" value={formatPrice(o.pending)} />
        <Stat label="Approved commission" value={formatPrice(o.approved)} />
        <Stat label="Paid out" value={formatPrice(o.paid)} />
        <Stat label="Available to withdraw" value={formatPrice(o.available)} />
      </div>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold text-brand">Withdraw earnings</h2>
        <BankForm initial={{ bankName: o.partner.bankName ?? "", accountNumber: o.partner.accountNumber ?? "", accountName: o.partner.accountName ?? "" }} />
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton url="/api/partner/payouts" label={`Request withdrawal of ${formatPrice(o.available)}`} tone="primary"
            confirmText={`Withdraw ${formatPrice(o.available)} to your saved bank account?`} />
          <span className="text-xs text-slate-500">
            Minimum {formatPrice(minimum)}. {!hasBank && "Save your bank details first. "}Only approved commissions can be withdrawn.
          </span>
        </div>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="border-b border-slate-100 p-4 font-semibold text-brand">Commissions</h2>
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-slate-100">
            {o.commissions.map((c) => (
              <tr key={c.id.toString()}>
                <td className="p-3">{c.transaction.property.title}</td>
                <td className="text-xs text-slate-500">{formatDate(c.createdAt)}</td>
                <td className="font-semibold">{formatPrice(c.amount)}</td>
                <td className="pr-3"><Badge value={c.status} /></td>
              </tr>
            ))}
            {o.commissions.length === 0 && <tr><td className="p-6 text-center text-slate-500">No commissions yet. Rewards appear when a referred customer completes a purchase or rental.</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="border-b border-slate-100 p-4 font-semibold text-brand">Payment history</h2>
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-slate-100">
            {o.payouts.map((x) => (
              <tr key={x.id.toString()}>
                <td className="p-3 text-xs text-slate-500">{formatDate(x.requestedAt)}</td>
                <td className="font-semibold">{formatPrice(x.amount)}</td>
                <td className="text-xs">{x.paymentReference ?? ""}</td>
                <td className="pr-3"><Badge value={x.status} /></td>
              </tr>
            ))}
            {o.payouts.length === 0 && <tr><td className="p-6 text-center text-slate-500">No withdrawals yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}

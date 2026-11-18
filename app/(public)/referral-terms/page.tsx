export const metadata = { title: "Referral programme terms" };

export default function ReferralTerms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold text-brand">Referral programme terms</h1>
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        Template wording. Have a Nigerian lawyer review and adapt these terms (including tax treatment of rewards) before launch.
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-slate-700">
        <li>Rewards are paid only for genuine buyers or tenants you introduce who complete a transaction with Celestia Estates. Enquiries alone earn nothing.</li>
        <li>A reward becomes payable only after the transaction is verified as completed and the related payment has been received by the company.</li>
        <li>The first referral link a visitor uses within 30 days owns that lead. If the person is already known to the company, or is the partner themselves, the referral is not eligible.</li>
        <li>Rewards are not paid for recruiting other partners.</li>
        <li>Reward amounts follow the company&apos;s published commission rules at the time the transaction completes.</li>
        <li>Withdrawals are paid to the bank account you provide, subject to the minimum withdrawal amount and applicable taxes.</li>
        <li>The company may suspend a partner and withhold rewards where fraud, misrepresentation or spam is suspected.</li>
        <li>Disputes should be raised in writing with the company, which will review them and respond within a reasonable time.</li>
      </ol>
    </div>
  );
}

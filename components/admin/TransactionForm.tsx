"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TransactionForm({ leads }: { leads: { id: string; label: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const res = await fetch("/api/admin/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const data = await res.json();
    if (res.ok) { form.reset(); setError(""); router.refresh(); } else setError(data.error ?? "Could not create transaction");
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-wrap items-end gap-3 p-4">
      <div className="min-w-64 flex-1">
        <label className="mb-1 block text-xs text-slate-500">Lead (inspection or negotiation stage)</label>
        <select name="leadId" required className="input" defaultValue="">
          <option value="" disabled>Select a lead</option>
          {leads.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">Agreed amount (₦)</label>
        <input name="amount" type="number" min={1} required className="input" />
      </div>
      <button className="btn">Open transaction</button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}

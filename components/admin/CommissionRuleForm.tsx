"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CommissionRuleForm() {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = Object.fromEntries(new FormData(form));
    const body: Record<string, unknown> = { ...fd };
    for (const k of ["transactionType", "fixedAmount", "percentage", "minPropertyValue", "maxPropertyValue"]) if (body[k] === "") body[k] = null;
    const res = await fetch("/api/admin/commission-rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (res.ok) { form.reset(); setMsg({ ok: true, text: "Rule created." }); router.refresh(); }
    else setMsg({ ok: false, text: (data.details && Object.values(data.details as Record<string, string[]>)[0]?.[0]) || data.error });
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <input name="name" required placeholder="Rule name" className="input lg:col-span-2" />
      <select name="transactionType" className="input" defaultValue="">
        <option value="">Any transaction</option><option value="SALE">Sale</option><option value="RENTAL">Rental</option><option value="LEASE">Lease</option>
      </select>
      <select name="calcType" className="input" defaultValue="PERCENTAGE">
        <option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed amount</option><option value="BOTH">Fixed + percentage</option>
      </select>
      <input name="percentage" type="number" step="0.01" min={0} max={100} placeholder="Percentage (%)" className="input" />
      <input name="fixedAmount" type="number" min={0} placeholder="Fixed amount (₦)" className="input" />
      <select name="base" className="input" defaultValue="AGENCY_COMMISSION">
        <option value="AGENCY_COMMISSION">% of agency commission</option><option value="PROPERTY_VALUE">% of property value</option>
      </select>
      <input name="priority" type="number" defaultValue={0} placeholder="Priority" className="input" />
      <input name="minPropertyValue" type="number" min={0} placeholder="Min property value" className="input" />
      <input name="maxPropertyValue" type="number" min={0} placeholder="Max property value" className="input" />
      <button className="btn lg:col-start-4">Add rule</button>
      {msg && <p className={`text-sm sm:col-span-2 lg:col-span-4 ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </form>
  );
}

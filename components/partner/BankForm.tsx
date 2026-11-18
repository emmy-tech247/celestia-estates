"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BankForm({ initial }: { initial: { bankName: string; accountNumber: string; accountName: string } }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch("/api/partner/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) });
    const data = await res.json();
    if (res.ok) { setMsg({ ok: true, text: "Bank details saved." }); router.refresh(); }
    else setMsg({ ok: false, text: (data.details && Object.values(data.details as Record<string, string[]>)[0]?.[0]) || data.error });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-3">
      <input name="bankName" required defaultValue={initial.bankName} placeholder="Bank name" className="input" />
      <input name="accountNumber" required defaultValue={initial.accountNumber} placeholder="10-digit account number" inputMode="numeric" className="input" />
      <input name="accountName" required defaultValue={initial.accountName} placeholder="Account name" className="input" />
      <button className="btn sm:col-span-3 sm:w-fit">Save bank details</button>
      {msg && <p className={`text-sm sm:col-span-3 ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </form>
  );
}

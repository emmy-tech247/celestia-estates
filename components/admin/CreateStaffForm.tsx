"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateStaffForm({ canCreateManager }: { canCreateManager: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const data = await res.json();
    if (res.ok) { setMsg({ ok: true, text: "User created." }); form.reset(); router.refresh(); }
    else setMsg({ ok: false, text: (data.details && Object.values(data.details as Record<string, string[]>)[0]?.[0]) || data.error });
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
      <input name="fullName" required placeholder="Full name" className="input lg:col-span-1" />
      <input name="email" type="email" required placeholder="Email" className="input lg:col-span-1" />
      <input name="phone" placeholder="Phone" className="input" />
      <input name="password" type="password" required minLength={8} placeholder="Temporary password" className="input" />
      <select name="role" className="input" defaultValue="AGENT">
        <option value="AGENT">Agent</option>
        {canCreateManager && <option value="MANAGER">Manager</option>}
        <option value="CUSTOMER">Customer</option>
      </select>
      <button className="btn">Add user</button>
      {msg && <p className={`text-sm sm:col-span-2 lg:col-span-6 ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </form>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Opt = string | { value: string; label: string };

/** Generic dropdown that PATCHes `${endpoint}/${id}` with { [field]: value }, then refreshes the page. */
export default function StatusSelect({
  endpoint, id, value, options, field = "status", disabled = false,
}: { endpoint: string; id: string; value: string; options: Opt[]; field?: string; disabled?: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o.charAt(0) + o.slice(1).toLowerCase().replace(/_/g, " ") } : o));
  if (!opts.some((o) => o.value === current)) opts.unshift({ value: current, label: current.charAt(0) + current.slice(1).toLowerCase().replace(/_/g, " ") });

  async function onChange(next: string) {
    const prev = current;
    setCurrent(next);
    const res = await fetch(`${endpoint}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: next === "" ? null : next }),
    });
    if (!res.ok) { setCurrent(prev); alert((await res.json()).error ?? "Update failed"); }
    router.refresh();
  }

  return (
    <select className="input !w-auto !py-1" value={current} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

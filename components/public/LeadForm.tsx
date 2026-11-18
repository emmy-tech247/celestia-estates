"use client";
import { useState } from "react";

const TYPES = [
  { value: "ENQUIRY", label: "Enquire about this property" },
  { value: "INFO_REQUEST", label: "Request more information" },
  { value: "CALLBACK", label: "Request a callback" },
];

export default function LeadForm({ propertyId, defaultName = "", defaultEmail = "" }: { propertyId?: string; defaultName?: string; defaultEmail?: string }) {
  const [state, setState] = useState<{ type: "idle" | "ok" | "error"; msg?: string }>({ type: "idle" });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = e.currentTarget;
    const body: Record<string, unknown> = Object.fromEntries(new FormData(form));
    const q = new URLSearchParams(window.location.search);
    for (const k of ["utmSource", "utmMedium", "utmCampaign"]) {
      const v = q.get(k.replace(/([A-Z])/g, "_$1").toLowerCase());
      if (v) body[k] = v.slice(0, 100);
    }
    if (propertyId) body.propertyId = propertyId;
    if (body.message === "") delete body.message;

    const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setBusy(false);
    if (res.ok) { setState({ type: "ok", msg: "Thanks! An agent will contact you shortly." }); form.reset(); }
    else setState({ type: "error", msg: data.details ? "Please check your details and try again." : data.error });
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <h3 className="font-semibold text-brand">Talk to an agent</h3>
      <select name="type" className="input" defaultValue="ENQUIRY">{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
      <input name="name" required defaultValue={defaultName} placeholder="Your name" className="input" />
      <input name="email" type="email" required defaultValue={defaultEmail} placeholder="Email address" className="input" />
      <input name="phone" placeholder="Phone number" className="input" />
      <textarea name="message" rows={3} placeholder="Anything we should know?" className="input" />
      <button className="btn w-full" disabled={busy}>{busy ? "Sending..." : "Send"}</button>
      {state.type !== "idle" && <p className={`text-sm ${state.type === "ok" ? "text-green-700" : "text-red-600"}`}>{state.msg}</p>}
    </form>
  );
}

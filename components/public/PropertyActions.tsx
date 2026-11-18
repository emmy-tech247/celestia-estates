"use client";
import Link from "next/link";
import { useState } from "react";
import { getSessionId } from "./session";

export function FavoriteButton({ propertyId, initial, signedIn }: { propertyId: string; initial: boolean; signedIn: boolean }) {
  const [saved, setSaved] = useState(initial);
  const [msg, setMsg] = useState("");

  async function toggle() {
    if (!signedIn) { setMsg("Sign in as a customer to save properties."); return; }
    const res = saved
      ? await fetch(`/api/customer/favorites/${propertyId}`, { method: "DELETE" })
      : await fetch("/api/customer/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ propertyId }) });
    if (res.ok) { setSaved(!saved); setMsg(""); } else setMsg((await res.json()).error);
  }

  return (
    <div>
      <button onClick={toggle} className={saved ? "btn" : "btn-outline"}>{saved ? "♥ Saved" : "♡ Save property"}</button>
      {msg && <p className="mt-1 text-xs text-slate-500">{msg} {!signedIn && <Link href="/login" className="text-gold underline">Sign in</Link>}</p>}
    </div>
  );
}

export function BookingForm({ propertyId, signedIn }: { propertyId: string; signedIn: boolean }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!signedIn) {
    return (
      <div className="card p-5 text-sm">
        <h3 className="font-semibold text-brand">Book an inspection</h3>
        <p className="mt-2 text-slate-600">
          <Link href="/login" className="text-gold underline">Sign in</Link> or <Link href="/register" className="text-gold underline">create an account</Link> to book a viewing.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/inspections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,
        scheduledAt: new Date(String(fd.get("when"))).toISOString(),
        notes: fd.get("notes") || undefined,
      }),
    });
    const data = await res.json();
    setBusy(false);
    setMsg(res.ok
      ? { ok: true, text: "Inspection requested. You'll be notified once it's confirmed." }
      : { ok: false, text: data.details?.scheduledAt?.[0] ?? data.error });
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <h3 className="font-semibold text-brand">Book an inspection</h3>
      <input name="when" type="datetime-local" required className="input" />
      <textarea name="notes" rows={2} placeholder="Notes (optional)" className="input" />
      <button className="btn w-full" disabled={busy}>{busy ? "Requesting..." : "Request inspection"}</button>
      {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </form>
  );
}

export function WhatsAppButton({ href, propertyId }: { href: string; propertyId: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn w-full !bg-green-600 hover:!bg-green-700"
      onClick={() => {
        const body = JSON.stringify({ type: "WHATSAPP_CLICK", sessionId: getSessionId(), propertyId, path: window.location.pathname });
        navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }));
      }}
    >
      Chat on WhatsApp
    </a>
  );
}

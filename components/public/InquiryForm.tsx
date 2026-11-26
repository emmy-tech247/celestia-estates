
"use client";

import { useState } from "react";

export default function InquiryForm({
  propertyId,
  defaultName = "",
  defaultEmail = "",
}: {
  propertyId: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, setState] = useState<{
    type: "idle" | "ok" | "error";
    msg?: string;
  }>({ type: "idle" });

  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);

    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          propertyId,
          type: "ENQUIRY",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({
          type: "error",
          msg: data.details
            ? "Please check your details and try again."
            : data.error || "Unable to submit your enquiry. Please try again.",
        });
        return;
      }

      setState({
        type: "ok",
        msg: "Thanks! An agent will contact you shortly.",
      });

      form.reset();
    } catch {
      setState({
        type: "error",
        msg: "Network error. Please check your connection and try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <h3 className="font-semibold text-brand">Send an enquiry</h3>

      <input
        name="name"
        required
        defaultValue={defaultName}
        placeholder="Your name"
        className="input"
      />

      <input
        name="email"
        type="email"
        required
        defaultValue={defaultEmail}
        placeholder="Email address"
        className="input"
      />

      <input
        name="phone"
        placeholder="Phone number"
        className="input"
      />

      <textarea
        name="message"
        required
        minLength={10}
        rows={4}
        placeholder="I'm interested in this property..."
        className="input"
      />

      <button className="btn w-full" disabled={busy}>
        {busy ? "Sending..." : "Send enquiry"}
      </button>

      {state.type !== "idle" && (
        <p
          className={`text-sm ${
            state.type === "ok" ? "text-green-700" : "text-red-600"
          }`}
        >
          {state.msg}
        </p>
      )}
    </form>
  );
}

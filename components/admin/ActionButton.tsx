"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Prompt = { key: string; message: string; optional?: boolean };

/** One button for any admin action: optional confirm, optional window.prompt value, then call the API and refresh. */
export default function ActionButton({
  url, method = "POST", body = {}, label, confirmText, prompt, tone = "outline",
}: {
  url: string; method?: string; body?: Record<string, unknown>; label: string;
  confirmText?: string; prompt?: Prompt; tone?: "primary" | "outline" | "danger";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run() {
    if (confirmText && !confirm(confirmText)) return;
    const payload: Record<string, unknown> = { ...body };
    if (prompt) {
      const v = window.prompt(prompt.message);
      if (v === null) return;
      if (v.trim() === "" && !prompt.optional) return;
      if (v.trim() !== "") payload[prompt.key] = v.trim();
    }
    setBusy(true);
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "DELETE" ? undefined : JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) alert(data.error ?? "Action failed");
    else if (data.warning) alert(data.warning);
    router.refresh();
  }

  const cls = tone === "primary" ? "btn" : tone === "danger" ? "btn-outline !text-red-600" : "btn-outline";
  return (
    <button disabled={busy} onClick={run} className={`${cls} !px-3 !py-1 text-xs`}>
      {busy ? "..." : label}
    </button>
  );
}

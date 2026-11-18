"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PropertyRowActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(url: string, method: string) {
    setBusy(true);
    const res = await fetch(url, { method });
    setBusy(false);
    if (!res.ok) alert((await res.json()).error ?? "Action failed");
    router.refresh();
  }

  const locked = ["SOLD", "RENTED", "ARCHIVED"].includes(status);
  return (
    <div className="flex gap-2">
      {status === "PUBLISHED" ? (
        <button disabled={busy} className="btn-outline !px-3 !py-1" onClick={() => run(`/api/admin/properties/${id}/publish?action=unpublish`, "POST")}>Unpublish</button>
      ) : !locked && (
        <button disabled={busy} className="btn !px-3 !py-1" onClick={() => run(`/api/admin/properties/${id}/publish`, "POST")}>Publish</button>
      )}
      {status !== "ARCHIVED" && (
        <button disabled={busy} className="btn-outline !px-3 !py-1 !text-red-600"
          onClick={() => confirm("Archive this property?") && run(`/api/admin/properties/${id}`, "DELETE")}>Archive</button>
      )}
    </div>
  );
}

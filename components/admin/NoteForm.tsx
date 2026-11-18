"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NoteForm({ endpoint }: { endpoint: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(fd)) });
    if (res.ok) { form.reset(); setError(""); router.refresh(); } else setError((await res.json()).error ?? "Could not save");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex gap-2">
        <select name="type" className="input !w-auto" defaultValue="NOTE">
          <option value="NOTE">Note</option><option value="CALL">Call</option><option value="EMAIL">Email</option>
        </select>
        <input name="body" required placeholder="What happened?" className="input" />
        <button className="btn">Add</button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

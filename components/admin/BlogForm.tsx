"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BlogForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const body: Record<string, unknown> = Object.fromEntries(new FormData(form));
    for (const k of ["coverImage", "excerpt", "categoryId"]) if (body[k] === "") delete body[k];
    const res = await fetch("/api/admin/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (res.ok) { form.reset(); setMsg({ ok: true, text: "Post saved." }); router.refresh(); }
    else setMsg({ ok: false, text: (data.details && Object.values(data.details as Record<string, string[]>)[0]?.[0]) || data.error });
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <input name="title" required placeholder="Title, e.g. How to buy land in Lugbe, Abuja" className="input" />
      <input name="excerpt" placeholder="Short summary for search results (max 160 characters)" maxLength={500} className="input" />
      <textarea name="content" required minLength={50} rows={10} placeholder={"Write the article. Leave a blank line between paragraphs. Start a line with '## ' for a heading."} className="input" />
      <div className="grid gap-3 sm:grid-cols-3">
        <select name="categoryId" className="input" defaultValue="">
          <option value="">No category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input name="coverImage" type="url" placeholder="Cover image URL (optional)" className="input" />
        <select name="status" className="input" defaultValue="DRAFT"><option value="DRAFT">Save as draft</option><option value="PUBLISHED">Publish now</option></select>
      </div>
      <button className="btn">Save post</button>
      {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </form>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Opt = { id: string; name: string };

export default function PropertyForm({ categories, features, agents }: { categories: Opt[]; features: Opt[]; agents: Opt[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const fd = new FormData(e.currentTarget);

    const payload = {
      title: fd.get("title"),
      description: fd.get("description"),
      price: fd.get("price"),
      listingType: fd.get("listingType"),
      categoryId: fd.get("categoryId"),
      agentId: fd.get("agentId") || null,
      bedrooms: fd.get("bedrooms") || 0,
      bathrooms: fd.get("bathrooms") || 0,
      toilets: fd.get("toilets") || 0,
      areaSqm: fd.get("areaSqm") || undefined,
      isFeatured: fd.get("isFeatured") === "on",
      featureIds: fd.getAll("featureIds"),
      location: { state: fd.get("state"), city: fd.get("city"), area: fd.get("area") || undefined },
      address: fd.get("address") || undefined,
      isVerified: fd.get("isVerified") === "on",
    };

    const res = await fetch("/api/admin/properties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setError((data.details && Object.entries(data.details as Record<string, string[]>).map(([k, v]) => `${k}: ${v[0]}`)[0]) || data.error);
      return;
    }

    const files = (fd.getAll("files") as File[]).filter((f) => f.size > 0);
    if (files.length) {
      const up = new FormData();
      files.forEach((f) => up.append("files", f));
      const imgRes = await fetch(`/api/admin/properties/${data.id}/images`, { method: "POST", body: up });
      if (!imgRes.ok) {
        setBusy(false);
        setError(`Property saved as a draft, but photos failed: ${(await imgRes.json()).error}`);
        return;
      }
    }
    router.push("/admin/properties");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-3xl space-y-4 p-6">
      <input name="title" required placeholder="Title, e.g. Luxury Duplex in Maitama" className="input" />
      <textarea name="description" required minLength={20} rows={5} placeholder="Description (min 20 characters)" className="input" />

      <div className="grid gap-3 sm:grid-cols-3">
        <input name="price" type="number" min={1} required placeholder="Price (₦)" className="input" />
        <select name="listingType" className="input" defaultValue="SALE">
          <option value="SALE">For sale</option><option value="RENT">For rent (per year)</option><option value="LEASE">For lease</option>
        </select>
        <select name="categoryId" required className="input" defaultValue="">
          <option value="" disabled>Property type</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <input name="state" required placeholder="State, e.g. FCT" className="input" />
        <input name="city" required placeholder="City, e.g. Abuja" className="input" />
        <input name="area" placeholder="Neighbourhood, e.g. Lugbe" className="input" />
      </div>
      <input name="address" placeholder="Street address (optional)" className="input" />

      <div className="grid gap-3 sm:grid-cols-4">
        <input name="bedrooms" type="number" min={0} placeholder="Bedrooms" className="input" />
        <input name="bathrooms" type="number" min={0} placeholder="Bathrooms" className="input" />
        <input name="toilets" type="number" min={0} placeholder="Toilets" className="input" />
        <input name="areaSqm" type="number" min={0} step="0.01" placeholder="Area (sqm)" className="input" />
      </div>

      <select name="agentId" className="input" defaultValue="">
        <option value="">No agent assigned</option>
        {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Features</legend>
        <div className="flex flex-wrap gap-3 text-sm">
          {features.map((f) => (
            <label key={f.id} className="flex items-center gap-1.5"><input type="checkbox" name="featureIds" value={f.id} /> {f.name}</label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="mb-1 block text-sm font-medium">Photos (JPEG/PNG/WebP, max 5MB each, up to 10)</label>
        <input name="files" type="file" multiple accept="image/jpeg,image/png,image/webp" className="input" />
        <p className="mt-1 text-xs text-slate-500">The first photo becomes the cover image.</p>
      </div>

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" /> Feature on the homepage</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="isVerified" /> Verified listing badge</label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? "Saving..." : "Save as draft"}</button>
    </form>
  );
}

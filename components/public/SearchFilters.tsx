type Cat = { name: string; slug: string };

function Field({ side, label, children }: { side: boolean; label: string; children: React.ReactNode }) {
  if (!side) return <>{children}</>;
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
      <div className="mt-1.5 font-normal normal-case tracking-normal">{children}</div>
    </label>
  );
}

export default function SearchFilters({
  categories, values = {}, variant = "bar",
}: { categories: Cat[]; values?: Record<string, string | undefined>; variant?: "bar" | "sidebar" }) {
  const side = variant === "sidebar";
  return (
    <form
      action="/properties"
      className={side ? "space-y-4" : "grid gap-3 rounded-2xl border border-white/30 bg-white/95 p-4 shadow-xl backdrop-blur sm:grid-cols-2 lg:grid-cols-4"}
    >
      <Field side={side} label="Location">
        <input name="location" defaultValue={values.location} placeholder="City, state or area" className="input" />
      </Field>
      <Field side={side} label="Listing type">
        <select name="listingType" defaultValue={values.listingType ?? ""} className="input">
          <option value="">Buy or rent</option>
          <option value="sale">For sale</option>
          <option value="rent">For rent</option>
          <option value="lease">For lease</option>
        </select>
      </Field>
      <Field side={side} label="Property type">
        <select name="category" defaultValue={values.category ?? ""} className="input">
          <option value="">All property types</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </Field>
      <Field side={side} label="Bedrooms">
        <select name="bedrooms" defaultValue={values.bedrooms ?? ""} className="input">
          <option value="">Any bedrooms</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ bedrooms</option>)}
        </select>
      </Field>
      <Field side={side} label="Price range">
        <div className="grid grid-cols-2 gap-2">
          <input name="minPrice" type="number" min={0} defaultValue={values.minPrice} placeholder="Min (₦)" className="input" />
          <input name="maxPrice" type="number" min={0} defaultValue={values.maxPrice} placeholder="Max (₦)" className="input" />
        </div>
      </Field>
      <Field side={side} label="Sort by">
        <select name="sort" defaultValue={values.sort ?? "newest"} className="input">
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </Field>
      <button className="btn w-full">{side ? "Show results" : "Search"}</button>
    </form>
  );
}

type Cat = { name: string; slug: string };

export default function SearchFilters({
  categories, values = {},
}: { categories: Cat[]; values?: Record<string, string | undefined> }) {
  return (
    <form action="/properties" className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <input name="location" defaultValue={values.location} placeholder="City, state or area" className="input" />
      <select name="listingType" defaultValue={values.listingType ?? ""} className="input">
        <option value="">Buy or rent</option>
        <option value="sale">For sale</option>
        <option value="rent">For rent</option>
        <option value="lease">For lease</option>
      </select>
      <select name="category" defaultValue={values.category ?? ""} className="input">
        <option value="">All property types</option>
        {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
      <select name="bedrooms" defaultValue={values.bedrooms ?? ""} className="input">
        <option value="">Any bedrooms</option>
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ bedrooms</option>)}
      </select>
      <input name="minPrice" type="number" min={0} defaultValue={values.minPrice} placeholder="Min price (₦)" className="input" />
      <input name="maxPrice" type="number" min={0} defaultValue={values.maxPrice} placeholder="Max price (₦)" className="input" />
      <select name="sort" defaultValue={values.sort ?? "newest"} className="input">
        <option value="newest">Newest first</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>
      <button className="btn">Search</button>
    </form>
  );
}

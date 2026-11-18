import Link from "next/link";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata("PAGE", "/locations", {
    title: "Property locations across Nigeria",
    description: "Browse houses, apartments and land for sale and rent by city and neighbourhood.",
    path: "/locations",
  });
}

export default async function LocationsPage() {
  const locs = await prisma.location.findMany({
    select: { slug: true, city: true, state: true, area: true, _count: { select: { properties: { where: { status: "PUBLISHED" } } } } },
    orderBy: [{ city: "asc" }, { area: "asc" }],
  });

  // group neighbourhoods under their city
  const cities = new Map<string, { city: string; state: string; total: number; areas: typeof locs }>();
  for (const l of locs) {
    const key = `${l.city}|${l.state}`;
    const c = cities.get(key) ?? { city: l.city, state: l.state, total: 0, areas: [] };
    c.total += l._count.properties;
    if (l.area && l._count.properties > 0) c.areas.push(l);
    cities.set(key, c);
  }
  const list = [...cities.values()].filter((c) => c.total > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand">Browse by location</h1>
      {list.length === 0 ? (
        <p className="card mt-8 p-10 text-center text-slate-500">No locations have published properties yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <div key={c.city + c.state} className="card p-5">
              <Link href={`/locations/${slugify(`${c.city} ${c.state}`)}`} className="text-lg font-semibold text-brand hover:text-gold">
                {c.city}, {c.state} <span className="text-sm font-normal text-slate-400">({c.total})</span>
              </Link>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {c.areas.map((a) => (
                  <li key={a.slug}><Link href={`/locations/${a.slug}`} className="rounded-full border border-slate-200 px-3 py-1 hover:border-gold">{a.area} ({a._count.properties})</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

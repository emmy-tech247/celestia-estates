import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { searchProperties } from "@/lib/properties";
import { placeName } from "@/lib/locations";
import { buildMetadata } from "@/lib/seo";
import PropertyCard from "@/components/public/PropertyCard";

type Props = { params: Promise<{ slug: string }> };

const getLocation = (slug: string) => prisma.location.findUnique({ where: { slug } });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const loc = await getLocation(slug);
  if (!loc) return { title: "Location not found", robots: { index: false } };
  const place = placeName(loc);
  return buildMetadata("LOCATION", slug, {
    title: `Properties for sale and rent in ${place}`,
    description: `Browse verified houses, apartments and land for sale and rent in ${place}. Book inspections and talk to a local agent.`,
    path: `/locations/${slug}`,
  });
}

export default async function LocationPage({ params }: Props) {
  const slug = (await params).slug;
  const loc = await getLocation(slug);
  if (!loc) notFound();
  const place = placeName(loc);

  const [result, neighbourhoods] = await Promise.all([
    searchProperties({ locationSlug: slug, limit: "24" }),
    loc.area
      ? Promise.resolve([])
      : prisma.location.findMany({ where: { city: loc.city, state: loc.state, area: { not: null }, properties: { some: { status: "PUBLISHED" } } }, select: { slug: true, area: true }, orderBy: { area: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand">Properties for sale and rent in {place}</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        {result.pagination.total} {result.pagination.total === 1 ? "property" : "properties"} currently available in {place}.
      </p>

      {neighbourhoods.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2 text-sm">
          {neighbourhoods.map((n) => <li key={n.slug}><Link href={`/locations/${n.slug}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 hover:border-gold">{n.area}</Link></li>)}
        </ul>
      )}

      {result.items.length === 0 ? (
        <p className="card mt-8 p-10 text-center text-slate-500">No properties are listed here right now. <Link href="/properties" className="text-gold underline">Browse all properties</Link></p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{result.items.map((p) => <PropertyCard key={p.id.toString()} p={p} />)}</div>
      )}
      {result.pagination.pages > 1 && (
        <p className="mt-8 text-center"><Link className="btn-outline" href={`/properties?location=${encodeURIComponent(loc.area ?? loc.city)}`}>See all {result.pagination.total} properties</Link></p>
      )}
    </div>
  );
}

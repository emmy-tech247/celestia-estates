import Link from "next/link";
import prisma from "@/lib/prisma";
import { searchProperties } from "@/lib/properties";
import PropertyCard from "@/components/public/PropertyCard";
import SearchFilters from "@/components/public/SearchFilters";
import { absoluteUrl, jsonLd, SITE_NAME, buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata("PAGE", "/", {
    title: "Houses, land and apartments for sale and rent in Nigeria",
    description: "Find verified houses, apartments and land for sale and rent in Abuja, Lagos and across Nigeria. Book inspections and talk to a local agent.",
    path: "/",
  });
}

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    prisma.propertyCategory.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
    searchProperties({ featured: "true", limit: "6" }),
  ]);
  const listings = featured.items.length ? featured : await searchProperties({ limit: "6" });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
        "@context": "https://schema.org", "@type": "RealEstateAgent", name: SITE_NAME, url: absoluteUrl("/"), areaServed: "NG",
      }) }} />
      <section className="bg-brand px-4 py-20 text-center text-white">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">Celestia Estates</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">Find a home that fits the life you want.</h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-300">Verified listings for sale and rent, with agents who respond.</p>
        <div className="mx-auto mt-10 max-w-5xl text-left text-slate-800">
          <SearchFilters categories={categories} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-brand">{featured.items.length ? "Featured properties" : "Latest properties"}</h2>
          <Link href="/properties" className="text-sm font-medium text-gold">View all →</Link>
        </div>
        {listings.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.items.map((p) => <PropertyCard key={p.id.toString()} p={p} />)}
          </div>
        ) : (
          <p className="card p-8 text-center text-slate-500">No properties have been published yet.</p>
        )}
      </section>
    </>
  );
}

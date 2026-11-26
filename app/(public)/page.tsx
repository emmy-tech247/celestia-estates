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
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0b1427_0%,#1f3558_48%,#b86f46_88%,#c9a24b_100%)] px-4 pb-32 pt-24 text-white">
        {/* decorative glass-house shapes */}
        <div aria-hidden className="pointer-events-none absolute -right-10 top-12 hidden h-72 w-[46%] -skew-x-6 rounded-sm border border-white/20 bg-gradient-to-br from-white/20 to-white/0 md:block" />
        <div aria-hidden className="pointer-events-none absolute right-24 top-40 hidden h-44 w-[30%] -skew-x-6 border border-white/20 bg-white/10 md:block" />
        <div className="relative mx-auto max-w-6xl">
          <p className="eyebrow !text-gold-light">Celestia Estates</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold uppercase leading-tight tracking-wide sm:text-6xl">Find a home that fits the life you want.</h1>
          <p className="mt-5 max-w-md text-slate-200">Verified listings for sale and rent, with agents who respond.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/properties" className="btn-gold">Search properties</Link>
            <Link href="/contact" className="btn-ghost-light">Talk to an agent</Link>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gold-light" aria-hidden />
        <div className="absolute inset-x-0 bottom-3 px-4">
          <div className="mx-auto max-w-5xl text-left text-slate-800">
            <SearchFilters categories={categories} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-24">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="display text-3xl text-brand">
            {featured.items.length ? <>Featured <em className="text-gold-dark">properties</em></> : <>Latest <em className="text-gold-dark">properties</em></>}
          </h2>
          <Link href="/properties" className="text-sm font-semibold text-gold-dark hover:underline">View all →</Link>
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

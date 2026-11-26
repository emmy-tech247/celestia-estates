import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { searchProperties } from "@/lib/properties";
import PropertyCard from "@/components/public/PropertyCard";
import SearchFilters from "@/components/public/SearchFilters";

export const metadata: Metadata = { title: "Properties" };

type SP = Record<string, string | string[] | undefined>;

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const raw = await searchParams;
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    const val = Array.isArray(v) ? v[0] : v;
    if (val) params[k] = val;
  }

  const [categories, result] = await Promise.all([
    prisma.propertyCategory.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
    searchProperties(params).catch(() => null), // malformed query string => show empty state, not a crash
  ]);

  const pageLink = (page: number) => `/properties?${new URLSearchParams({ ...params, page: String(page) })}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="display text-4xl text-brand">Properties</h1>
        {result && result.items.length > 0 && (
          <p className="text-sm font-medium text-slate-500">{result.pagination.total} properties found</p>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[290px_1fr]">
        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand">Filters</h2>
          <SearchFilters categories={categories} values={params} variant="sidebar" />
        </aside>

        <div>
          {!result || result.items.length === 0 ? (
            <p className="card p-10 text-center text-slate-500">No properties match your search.</p>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((p) => <PropertyCard key={p.id.toString()} p={p} />)}
              </div>
              {result.pagination.pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4 text-sm">
                  {result.pagination.page > 1 && <Link className="btn-outline" href={pageLink(result.pagination.page - 1)}>← Previous</Link>}
                  <span>Page {result.pagination.page} of {result.pagination.pages}</span>
                  {result.pagination.page < result.pagination.pages && <Link className="btn-outline" href={pageLink(result.pagination.page + 1)}>Next →</Link>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

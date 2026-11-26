import Link from "next/link";
import type { PropertyListItem } from "@/lib/properties";
import { formatPrice, listingLabel } from "@/lib/format";

const icon = "h-4 w-4 text-slate-400";

export default function PropertyCard({ p }: { p: PropertyListItem }) {
  const img = p.images[0]?.imageUrl;
  return (
    <Link href={`/properties/${p.slug}`} className="card group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={p.images[0]?.altText ?? p.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No photo yet</div>
        )}
        <span className="absolute left-3 top-3 rounded-md bg-brand/90 px-2.5 py-1 text-xs font-semibold text-white">
          {listingLabel(p.listingType)}
        </span>
        {p.isVerified && (
          <span className="absolute bottom-3 left-3 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">✓ Verified</span>
        )}
        {p.isFeatured && (
          <span className="absolute right-3 top-3 rounded-md bg-gold-light px-2.5 py-1 text-xs font-semibold text-brand">Featured</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xl font-bold text-brand">{formatPrice(p.price, p.currency, p.listingType)}</p>
        <h3 className="mt-1 line-clamp-1 font-semibold text-slate-800">{p.title}</h3>
        <p className="line-clamp-1 text-sm text-slate-500">{p.location.area ? `${p.location.area}, ` : ""}{p.location.city}, {p.location.state}</p>
        <div className="mt-4 flex gap-5 border-t border-slate-100 pt-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M3 18v2m18-2v2M7 9V6h4v3" /></svg>
            {p.bedrooms} bed
          </span>
          <span className="flex items-center gap-1.5">
            <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V6a2 2 0 0 1 4 0" /></svg>
            {p.bathrooms} bath
          </span>
          {p.areaSqm && (
            <span className="flex items-center gap-1.5">
              <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16v16H4zM4 10h6M10 4v6" /></svg>
              {Number(p.areaSqm)} sqm
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

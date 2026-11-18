import Link from "next/link";
import type { PropertyListItem } from "@/lib/properties";
import { formatPrice, listingLabel } from "@/lib/format";

export default function PropertyCard({ p }: { p: PropertyListItem }) {
  const img = p.images[0]?.imageUrl;
  return (
    <Link href={`/properties/${p.slug}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="relative aspect-[4/3] bg-slate-200">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={p.images[0]?.altText ?? p.title} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No photo yet</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-brand/90 px-3 py-1 text-xs font-medium text-white">
          {listingLabel(p.listingType)}
        </span>
        {p.isVerified && (
          <span className="absolute bottom-3 left-3 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">✓ Verified</span>
        )}
        {p.isFeatured && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-medium text-white">Featured</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-lg font-bold text-brand">{formatPrice(p.price, p.currency, p.listingType)}</p>
        <h3 className="mt-1 line-clamp-1 font-semibold">{p.title}</h3>
        <p className="text-sm text-slate-500">{p.location.area ? `${p.location.area}, ` : ""}{p.location.city}, {p.location.state}</p>
        <p className="mt-3 flex gap-4 text-xs text-slate-600">
          <span>{p.bedrooms} bed</span><span>{p.bathrooms} bath</span>
          {p.areaSqm && <span>{Number(p.areaSqm)} sqm</span>}
        </p>
      </div>
    </Link>
  );
}

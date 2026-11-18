import Link from "next/link";
import prisma from "@/lib/prisma";
import { requirePageRole } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import RemoveFavoriteButton from "@/components/customer/RemoveFavoriteButton";

export default async function Favorites() {
  const user = await requirePageRole(["CUSTOMER"]);
  const items = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { property: { include: { location: true, images: { where: { isPrimary: true }, take: 1 } } } },
  });

  if (items.length === 0) {
    return <p className="card p-8 text-center text-slate-500">No saved properties. <Link href="/properties" className="text-gold underline">Browse listings</Link></p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(({ property: p }) => (
        <div key={p.id.toString()} className="card overflow-hidden">
          {p.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.images[0].imageUrl} alt={p.title} className="aspect-[4/3] w-full object-cover" />
          ) : <div className="flex aspect-[4/3] items-center justify-center bg-slate-200 text-sm text-slate-400">No photo</div>}
          <div className="space-y-1 p-4">
            <p className="font-semibold">{p.title}</p>
            <p className="text-sm text-slate-500">{p.location.city}, {p.location.state}</p>
            <p className="font-bold text-brand">{formatPrice(p.price, p.currency, p.listingType)}</p>
            {p.status !== "PUBLISHED" && <p className="text-xs text-amber-600">No longer available</p>}
            <div className="flex gap-2 pt-2">
              {p.status === "PUBLISHED" && <Link href={`/properties/${p.slug}`} className="btn !px-3 !py-1 text-xs">View</Link>}
              <RemoveFavoriteButton propertyId={p.id.toString()} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

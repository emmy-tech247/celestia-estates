import Link from "next/link";
import prisma from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import PropertyRowActions from "@/components/admin/PropertyRowActions";
import { formatPrice, listingLabel } from "@/lib/format";
import { placeName } from "@/lib/locations";

export default async function AdminProperties() {
  const items = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: { location: true, category: true, agent: { select: { fullName: true } }, _count: { select: { images: true } } },
  });

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-sm text-slate-500">{items.length} properties</p>
        <Link href="/admin/properties/new" className="btn">Add property</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
            <tr><th className="p-3">Property</th><th>Type</th><th>Price</th><th>Agent</th><th>Photos</th><th>Status</th><th className="pr-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((p) => (
              <tr key={p.id.toString()}>
                <td className="p-3"><p className="font-medium">{p.title}</p><p className="text-xs text-slate-500">{placeName(p.location)}</p></td>
                <td>{p.category.name}<br /><span className="text-xs text-slate-500">{listingLabel(p.listingType)}</span></td>
                <td>{formatPrice(p.price, p.currency, p.listingType)}</td>
                <td>{p.agent?.fullName ?? <span className="text-slate-400">Unassigned</span>}</td>
                <td>{p._count.images}</td>
                <td><Badge value={p.status} /></td>
                <td className="pr-3"><PropertyRowActions id={p.id.toString()} status={p.status} /></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-500">Nothing here yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

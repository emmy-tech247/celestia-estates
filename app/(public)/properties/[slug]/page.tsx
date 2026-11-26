import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { formatPrice, listingLabel } from "@/lib/format";
import { placeName } from "@/lib/locations";
import { absoluteUrl, buildMetadata, jsonLd } from "@/lib/seo";
import { propertyListSelect } from "@/lib/properties";
import PropertyCard from "@/components/public/PropertyCard";
import LeadForm from "@/components/public/LeadForm";
import Tracker from "@/components/public/Tracker";
import { BookingForm, FavoriteButton, WhatsAppButton } from "@/components/public/PropertyActions";

type Props = { params: Promise<{ slug: string }> };

const getProperty = (slug: string) =>
  prisma.property.findFirst({
    where: { slug, status: { in: ["PUBLISHED", "RESERVED"] } }, // reserved pages stay live (and say so) to keep their rankings
    include: {
      location: true, category: true,
      images: { orderBy: { sortOrder: "asc" } },
      features: { include: { feature: true } },
      agent: { select: { fullName: true, phone: true } },
    },
  });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProperty((await params).slug);
  if (!p) return { title: "Property not found", robots: { index: false } };
  const place = placeName(p.location);
  return buildMetadata("PROPERTY", p.slug, {
    title: `${p.title} - ${listingLabel(p.listingType)} in ${place}`,
    description: `${listingLabel(p.listingType)} in ${place}: ${p.bedrooms} bed, ${p.bathrooms} bath ${p.category.name.toLowerCase()} at ${formatPrice(p.price, p.currency, p.listingType)}. ${p.description}`,
    path: `/properties/${p.slug}`,
    image: p.images[0]?.imageUrl,
  });
}

export default async function PropertyPage({ params }: Props) {
  const p = await getProperty((await params).slug);
  if (!p) notFound();

  const user = await getCurrentUser();
  const isCustomer = user?.role.name === "CUSTOMER";
  const [saved, related, waNumber] = await Promise.all([
    isCustomer ? prisma.favorite.findUnique({ where: { userId_propertyId: { userId: user!.id, propertyId: p.id } } }).then(Boolean) : Promise.resolve(false),
    prisma.property.findMany({
      where: { status: "PUBLISHED", id: { not: p.id }, OR: [{ categoryId: p.categoryId, location: { city: p.location.city } }, { locationId: p.locationId }] },
      orderBy: { createdAt: "desc" }, take: 3, select: propertyListSelect,
    }),
    getSetting<string>("whatsapp_number", process.env.WHATSAPP_NUMBER ?? ""),
  ]);

  const place = placeName(p.location);
  const path = `/properties/${p.slug}`;
  const wa = (waNumber || process.env.WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const waHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Hello, I'm interested in "${p.title}" ${absoluteUrl(path)}`)}` : null;
  const available = p.status === "PUBLISHED";

  const structured = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description,
    url: absoluteUrl(path),
    datePosted: (p.publishedAt ?? p.createdAt).toISOString(),
    image: p.images.map((i) => i.imageUrl),
    address: { "@type": "PostalAddress", streetAddress: p.address ?? undefined, addressLocality: p.location.area ?? p.location.city, addressRegion: p.location.state, addressCountry: "NG" },
    offers: {
      "@type": "Offer", price: Number(p.price), priceCurrency: p.currency,
      availability: available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Properties", item: absoluteUrl("/properties") },
      { "@type": "ListItem", position: 2, name: place, item: absoluteUrl(`/locations/${p.location.slug}`) },
      { "@type": "ListItem", position: 3, name: p.title, item: absoluteUrl(path) },
    ],
  };

  const [main, ...rest] = p.images;
  const thumbs = rest.slice(0, 4);
  const more = rest.slice(4);
  const initials = p.agent?.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <Tracker type="PROPERTY_VIEW" propertyId={p.id.toString()} />

      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/properties" className="hover:text-gold-dark">Properties</Link> ›{" "}
        <Link href={`/locations/${p.location.slug}`} className="hover:text-gold-dark">{place}</Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {main ? (
            <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={main.imageUrl} alt={main.altText ?? p.title} loading="eager"
                className={`h-full w-full rounded-2xl object-cover aspect-[16/10] ${thumbs.length ? "sm:col-span-2 sm:row-span-2" : "sm:col-span-4 sm:row-span-2"}`} />
              {thumbs.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={img.id.toString()} src={img.imageUrl} alt={img.altText ?? p.title} loading="lazy" className="aspect-[4/3] h-full w-full rounded-2xl object-cover" />
              ))}
            </div>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-slate-200 text-slate-400">No photos yet</div>
          )}
          {more.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {more.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={img.id.toString()} src={img.imageUrl} alt={img.altText ?? p.title} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-brand px-3 py-1 text-xs font-semibold text-white">{listingLabel(p.listingType)}</span>
                {p.isVerified && <span className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">✓ Verified</span>}
                {!available && <span className="rounded-md bg-amber-500 px-3 py-1 text-xs font-semibold text-white">Reserved</span>}
              </div>
              <h1 className="display mt-3 text-4xl text-brand">{p.title}</h1>
              <p className="mt-1 text-slate-500">{[p.address, place].filter(Boolean).join(", ")}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gold-dark">{formatPrice(p.price, p.currency, p.listingType)}</p>
              <div className="mt-2 flex justify-end"><FavoriteButton propertyId={p.id.toString()} initial={saved} signedIn={isCustomer} /></div>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Bedrooms", p.bedrooms], ["Bathrooms", p.bathrooms], ["Toilets", p.toilets], ["Area", p.areaSqm ? `${Number(p.areaSqm)} sqm` : "-"]].map(([k, v]) => (
              <div key={String(k)} className="card p-4 text-center"><dt className="text-xs uppercase tracking-wide text-slate-500">{k}</dt><dd className="mt-1 text-xl font-semibold text-brand">{v}</dd></div>
            ))}
          </dl>

          <div className="card mt-8 p-6">
            <h2 className="display text-2xl text-brand">Property <em className="text-gold-dark">description</em></h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">{p.description}</p>
          </div>

          {p.features.length > 0 && (
            <div className="card mt-6 p-6">
              <h2 className="display text-2xl text-brand">Facts &amp; <em className="text-gold-dark">features</em></h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.features.map((f) => <li key={f.featureId.toString()} className="rounded-full border border-slate-200 bg-canvas px-4 py-1.5 text-sm text-slate-700">{f.feature.name}</li>)}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          {p.agent && (
            <div className="card p-5 text-sm">
              <p className="eyebrow">Meet your agent</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand font-semibold text-gold-light">{initials}</span>
                <p className="font-semibold text-brand">{p.agent.fullName}</p>
              </div>
              {p.agent.phone && <a href={`tel:${p.agent.phone}`} className="btn mt-4 w-full">Call {p.agent.phone}</a>}
            </div>
          )}
          {waHref && <WhatsAppButton href={waHref} propertyId={p.id.toString()} />}
          {available ? (
            <>
              <LeadForm propertyId={p.id.toString()} defaultName={user?.fullName} defaultEmail={user?.email} />
              <BookingForm propertyId={p.id.toString()} signedIn={isCustomer} />
            </>
          ) : (
            <p className="card p-5 text-sm text-slate-600">This property is currently reserved. Browse similar properties below.</p>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="display mb-6 text-3xl text-brand">Explore similar <em className="text-gold-dark">properties</em></h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map((r) => <PropertyCard key={r.id.toString()} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}

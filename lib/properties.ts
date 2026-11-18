import type { Prisma } from "@prisma/client";
import prisma from "./prisma";
import { propertyQuerySchema } from "./validation";

export const propertyListSelect = {
    id: true, slug: true, title: true, price: true, currency: true, listingType: true,
    bedrooms: true, bathrooms: true, toilets: true, areaSqm: true, isFeatured: true, isVerified: true, address: true,
    location: { select: { state: true, city: true, area: true, slug: true } },
    category: { select: { name: true, slug: true } },
    images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true, altText: true } },
} satisfies Prisma.PropertySelect;

export async function searchProperties(input: Record<string, unknown>) {
  // HTML forms submit empty strings for untouched fields; drop them before validating.
  const clean = Object.fromEntries(
    Object.entries(input).filter(([, v]) => typeof v === "string" && v !== "")
  );
  const q = propertyQuerySchema.parse(clean);

  const empty = { items: [] as PropertyListItem[], pagination: { page: q.page, limit: q.limit, total: 0, pages: 0 } };
  const and: Prisma.PropertyWhereInput[] = [{ status: "PUBLISHED" }];

  if (q.listingType) and.push({ listingType: q.listingType.toUpperCase() as "SALE" | "RENT" | "LEASE" });
  if (q.category) and.push({ category: { slug: q.category } });
  if (q.bedrooms !== undefined) and.push({ bedrooms: { gte: q.bedrooms } });
  if (q.featured) and.push({ isFeatured: q.featured === "true" });
  if (q.minPrice !== undefined || q.maxPrice !== undefined) and.push({ price: { gte: q.minPrice, lte: q.maxPrice } });

  if (q.locationSlug) {
    const loc = await prisma.location.findUnique({ where: { slug: q.locationSlug } });
    if (!loc) return empty;
    // A city-level location (no area) includes every neighbourhood in that city.
    and.push(loc.area ? { locationId: loc.id } : { location: { city: loc.city, state: loc.state } });
  }
  if (q.location) {
    and.push({
      OR: [
        { address: { contains: q.location } },
        { location: { city: { contains: q.location } } },
        { location: { state: { contains: q.location } } },
        { location: { area: { contains: q.location } } },
      ],
    });
  }

  const where: Prisma.PropertyWhereInput = { AND: and };
  const orderBy: Prisma.PropertyOrderByWithRelationInput =
    q.sort === "price_asc" ? { price: "asc" } : q.sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" };

  const [total, items] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy,
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      select: propertyListSelect,
    }),
  ]);

  return { items, pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } };
}

export type PropertyListItem = Prisma.PropertyGetPayload<{ select: typeof propertyListSelect }>;

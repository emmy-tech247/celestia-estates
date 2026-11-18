import prisma from "@/lib/prisma";
import { handle, json, readJson, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { favoriteSchema } from "@/lib/validation";

export const GET = handle(async () => {
  const u = await requireUser("CUSTOMER");
  const items = await prisma.favorite.findMany({
    where: { userId: u.id },
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        select: {
          id: true, slug: true, title: true, price: true, currency: true, listingType: true, status: true,
          location: { select: { city: true, state: true } },
          images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
        },
      },
    },
  });
  return json({ items });
});

export const POST = handle(async (req) => {
  const u = await requireUser("CUSTOMER");
  const { propertyId } = favoriteSchema.parse(await readJson(req));

  const property = await prisma.property.findFirst({ where: { id: propertyId, status: "PUBLISHED" }, select: { id: true } });
  if (!property) throw new ApiError(404, "Property not found");

  // Idempotent: saving twice is not an error.
  const fav = await prisma.favorite.upsert({
    where: { userId_propertyId: { userId: u.id, propertyId } },
    update: {},
    create: { userId: u.id, propertyId },
  });
  return json(fav, 201);
});

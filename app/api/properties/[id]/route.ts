import prisma from "@/lib/prisma";
import { handle, json, ApiError } from "@/lib/api";

// Accepts a numeric id or a slug, so /properties/[slug] pages can reuse this endpoint.
export const GET = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const key = /^\d+$/.test(id) ? { id: BigInt(id) } : { slug: id };

  const property = await prisma.property.findFirst({
    where: { ...key, status: "PUBLISHED" },
    include: {
      location: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      features: { include: { feature: true } },
      agent: { select: { id: true, fullName: true, phone: true, profileImage: true } },
    },
  });
  if (!property) throw new ApiError(404, "Property not found");
  return json(property);
});

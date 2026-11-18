import prisma from "@/lib/prisma";
import { handle, json, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/utils";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const unpublish = new URL(req.url).searchParams.get("action") === "unpublish";

  const property = await prisma.property.findUnique({ where: { id }, include: { images: { select: { id: true } } } });
  if (!property) throw new ApiError(404, "Property not found");

  if (!unpublish) {
    if (["SOLD", "RENTED", "RESERVED"].includes(property.status)) {
      throw new ApiError(409, "Sold, rented or reserved properties cannot be republished");
    }
    if (property.images.length === 0) throw new ApiError(422, "Add at least one image before publishing");
  }

  const updated = await prisma.property.update({
    where: { id },
    data: { status: unpublish ? "DRAFT" : "PUBLISHED", ...(!unpublish && !property.publishedAt ? { publishedAt: new Date() } : {}) },
  });
  await audit(user.id, unpublish ? "property.unpublish" : "property.publish", "property", id);
  return json(updated);
});

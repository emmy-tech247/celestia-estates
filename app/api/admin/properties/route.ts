import prisma from "@/lib/prisma";
import { handle, json, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { propertySchema } from "@/lib/validation";
import { uniquePropertySlug, audit } from "@/lib/utils";
import { upsertLocation } from "@/lib/locations";

// Staff list: admins see everything, agents only their assigned properties.
export const GET = handle(async () => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER", "AGENT");
  const items = await prisma.property.findMany({
    where: user.role.name === "AGENT" ? { agentId: user.id } : {},
    orderBy: { createdAt: "desc" },
    include: { location: true, category: true, images: { where: { isPrimary: true }, take: 1 } },
  });
  return json({ items });
});

// Only admins/managers create listings. New listings start as DRAFT.
export const POST = handle(async (req) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER");
  const data = propertySchema.parse(await readJson(req));
  const { location, featureIds, ...rest } = data;
  const loc = await upsertLocation(location);

  const property = await prisma.property.create({
    data: {
      ...rest,
      slug: await uniquePropertySlug(data.title),
      ownerId: user.id,
      status: "DRAFT",
      locationId: loc.id,
      features: { create: featureIds.map((featureId) => ({ featureId })) },
    },
  });

  await audit(user.id, "property.create", "property", property.id);
  return json(property, 201);
});

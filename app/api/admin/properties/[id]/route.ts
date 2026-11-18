import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { propertyUpdateSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";
import { upsertLocation } from "@/lib/locations";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handle(async (req, ctx: Ctx) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER", "AGENT");
  const id = parseId((await ctx.params).id);

  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Property not found");
  if (user.role.name === "AGENT" && existing.agentId !== user.id) {
    throw new ApiError(403, "This property is not assigned to you");
  }

  const data = propertyUpdateSchema.parse(await readJson(req));
  const { location, featureIds, agentId, isVerified, ...rest } = data;
  const isAdmin = user.role.name !== "AGENT";
  const locationId = location ? (await upsertLocation(location)).id : undefined;

  const updated = await prisma.$transaction(async (tx) => {
    if (featureIds) {
      await tx.propertyFeatureAssignment.deleteMany({ where: { propertyId: id } });
      await tx.propertyFeatureAssignment.createMany({ data: featureIds.map((featureId) => ({ propertyId: id, featureId })) });
    }
    return tx.property.update({
      where: { id },
      data: {
        ...rest,
        locationId,
        // Only admins may reassign agents or grant the "verified" badge.
        ...(isAdmin && agentId !== undefined ? { agentId } : {}),
        ...(isAdmin && isVerified !== undefined ? { isVerified } : {}),
      },
    });
  });

  await audit(user.id, "property.update", "property", id);
  return json(updated);
});

// "Delete" archives: listings tied to transactions and leads must keep their history.
export const DELETE = handle(async (_req, ctx: Ctx) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const existing = await prisma.property.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new ApiError(404, "Property not found");

  await prisma.property.update({ where: { id }, data: { status: "ARCHIVED" } });
  await audit(user.id, "property.archive", "property", id);
  return json({ ok: true });
});

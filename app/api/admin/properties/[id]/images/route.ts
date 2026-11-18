import prisma from "@/lib/prisma";
import { handle, json, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { audit } from "@/lib/utils";

const MAX_FILES_PER_PROPERTY = 10;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER", "AGENT");
  const id = parseId((await ctx.params).id);

  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { select: { id: true, sortOrder: true } } },
  });
  if (!property) throw new ApiError(404, "Property not found");
  if (user.role.name === "AGENT" && property.agentId !== user.id) {
    throw new ApiError(403, "This property is not assigned to you");
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) throw new ApiError(400, "Attach at least one image in the 'files' field");
  if (property.images.length + files.length > MAX_FILES_PER_PROPERTY) {
    throw new ApiError(422, `A property can have at most ${MAX_FILES_PER_PROPERTY} images`);
  }
  for (const f of files) {
    if (!ALLOWED.includes(f.type)) throw new ApiError(422, "Only JPEG, PNG or WebP images are allowed");
    if (f.size > MAX_BYTES) throw new ApiError(422, "Each image must be 5MB or smaller");
  }

  const urls = await Promise.all(files.map((f) => uploadImage(f)));
  const start = property.images.reduce((m, i) => Math.max(m, i.sortOrder + 1), 0);
  const hasPrimary = property.images.length > 0;

  await prisma.propertyImage.createMany({
    data: urls.map((imageUrl, i) => ({
      propertyId: id,
      imageUrl,
      altText: property.title,
      sortOrder: start + i,
      isPrimary: !hasPrimary && i === 0,
    })),
  });

  await audit(user.id, "property.images.upload", "property", id, { count: urls.length });
  return json({ uploaded: urls }, 201);
});

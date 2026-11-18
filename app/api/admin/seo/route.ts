import prisma from "@/lib/prisma";
import { handle, json, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { seoSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";

// Upserts a title/description/canonical/OG/noindex override for a property, location, blog post or page.
export const POST = handle(async (req) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER");
  const { entityType, entityKey, ...rest } = seoSchema.parse(await readJson(req));
  const row = await prisma.seoMetadata.upsert({
    where: { entityType_entityKey: { entityType, entityKey } },
    update: rest,
    create: { entityType, entityKey, ...rest },
  });
  await audit(user.id, "seo.upsert", "seo_metadata", row.id);
  return json(row);
});

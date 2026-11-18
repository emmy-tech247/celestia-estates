import prisma from "@/lib/prisma";
import { handle, json, readJson, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { redirectSchema } from "@/lib/validation";

export const GET = handle(async () => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  return json({ items: await prisma.redirect.findMany({ orderBy: { createdAt: "desc" }, take: 500 }) });
});

export const POST = handle(async (req) => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  const data = redirectSchema.parse(await readJson(req));
  if (data.fromPath === data.toPath) throw new ApiError(422, "A redirect cannot point to itself");
  const r = await prisma.redirect.upsert({ where: { fromPath: data.fromPath }, update: data, create: data });
  return json(r, 201);
});

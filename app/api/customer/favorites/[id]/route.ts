import prisma from "@/lib/prisma";
import { handle, json, parseId } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const DELETE = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireUser("CUSTOMER");
  const propertyId = parseId((await ctx.params).id);
  await prisma.favorite.deleteMany({ where: { userId: u.id, propertyId } });
  return json({ ok: true });
});

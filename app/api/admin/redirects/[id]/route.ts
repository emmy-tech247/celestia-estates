import prisma from "@/lib/prisma";
import { handle, json, parseId } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const DELETE = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  await prisma.redirect.deleteMany({ where: { id: parseId((await ctx.params).id) } });
  return json({ ok: true });
});

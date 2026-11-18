import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { leadActivitySchema } from "@/lib/validation";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const data = leadActivitySchema.parse(await readJson(req));
  if (!(await prisma.lead.findUnique({ where: { id }, select: { id: true } }))) throw new ApiError(404, "Lead not found");

  const activity = await prisma.leadActivity.create({ data: { leadId: id, userId: user.id, ...data } });
  if (data.type !== "NOTE") await prisma.lead.update({ where: { id }, data: { lastContactedAt: new Date() } });
  return json(activity, 201);
});

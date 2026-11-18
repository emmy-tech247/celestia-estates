import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { leadActivitySchema } from "@/lib/validation";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireUser("AGENT");
  const id = parseId((await ctx.params).id);
  const data = leadActivitySchema.parse(await readJson(req));

  const lead = await prisma.lead.findUnique({ where: { id }, select: { assignedAgentId: true } });
  if (!lead) throw new ApiError(404, "Lead not found");
  if (lead.assignedAgentId !== u.id) throw new ApiError(403, "This lead is not assigned to you");

  const activity = await prisma.leadActivity.create({ data: { leadId: id, userId: u.id, ...data } });
  if (data.type !== "NOTE") await prisma.lead.update({ where: { id }, data: { lastContactedAt: new Date() } });
  return json(activity, 201);
});

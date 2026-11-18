import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { leadUpdateSchema } from "@/lib/validation";
import { changeStage } from "@/lib/leads";

// Agents move their own leads through the pipeline. They cannot reassign, and "won" only happens via a transaction.
export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireUser("AGENT");
  const id = parseId((await ctx.params).id);
  const { stage, lostReason } = leadUpdateSchema.pick({ stage: true, lostReason: true }).parse(await readJson(req));

  const lead = await prisma.lead.findUnique({ where: { id }, select: { assignedAgentId: true } });
  if (!lead) throw new ApiError(404, "Lead not found");
  if (lead.assignedAgentId !== u.id) throw new ApiError(403, "This lead is not assigned to you");

  if (stage) await changeStage(id, stage, u.id, lostReason);
  return json(await prisma.lead.findUnique({ where: { id } }));
});

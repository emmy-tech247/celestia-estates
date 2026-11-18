import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { leadUpdateSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";
import { changeStage, reassignLead } from "@/lib/leads";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle(async (_req, ctx: Ctx) => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      property: { select: { title: true, slug: true } },
      assignedAgent: { select: { id: true, fullName: true } },
      activities: { orderBy: { createdAt: "desc" }, include: { user: { select: { fullName: true } } } },
      inspections: true,
      deals: true,
      attribution: true,
    },
  });
  if (!lead) throw new ApiError(404, "Lead not found");
  return json(lead);
});

export const PATCH = handle(async (req, ctx: Ctx) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const data = leadUpdateSchema.parse(await readJson(req));

  if (data.assignedAgentId !== undefined) await reassignLead(id, data.assignedAgentId, user.id);
  if (data.stage) await changeStage(id, data.stage, user.id, data.lostReason);

  await audit(user.id, "lead.update", "lead", id, { stage: data.stage, assignedAgentId: data.assignedAgentId?.toString() ?? null });
  return json(await prisma.lead.findUnique({ where: { id } }));
});

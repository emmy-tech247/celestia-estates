import { prisma } from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { inquiryUpdateSchema } from "@/lib/validation";
import { z } from "zod";

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireUser("AGENT");
  const id = parseId((await ctx.params).id);
  const { status } = z.object({
  status: z.string().trim().min(1).max(50),
}).parse(await readJson(req));

  const inquiry = await prisma.inquiry.findUnique({ where: { id }, select: { assignedAgentId: true } });
  if (!inquiry) throw new ApiError(404, "Enquiry not found");
  if (inquiry.assignedAgentId !== u.id) throw new ApiError(403, "This enquiry is not assigned to you");

  return json(await prisma.inquiry.update({ where: { id }, data: { status } }));
});

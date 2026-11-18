import { prisma } from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { inquiryUpdateSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const data = inquiryUpdateSchema.parse(await readJson(req));

  if (data.assignedAgentId) {
    const agent = await prisma.user.findFirst({ where: { id: data.assignedAgentId, role: { name: "AGENT" }, status: "ACTIVE" } });
    if (!agent) throw new ApiError(422, "Assigned user is not an active agent");
  }
  const exists = await prisma.inquiry.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new ApiError(404, "Enquiry not found");

  const updated = await prisma.inquiry.update({ where: { id }, data });
  await audit(user.id, "inquiry.update", "inquiry", id, data as object);
  return json(updated);
});

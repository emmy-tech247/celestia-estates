import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { inspectionUpdateSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const data = inspectionUpdateSchema.parse(await readJson(req));

  const existing = await prisma.inspection.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Inspection not found");

  // Changing the date without an explicit status counts as a reschedule.
  const status = data.status ?? (data.scheduledAt ? "RESCHEDULED" : undefined);
  const updated = await prisma.inspection.update({ where: { id }, data: { ...data, status } });

  if (existing.customerId) {
    await prisma.notification.create({
      data: { userId: existing.customerId, title: `Inspection ${updated.status.toLowerCase()}`, body: "Check your inspections for details." },
    });
  }
  await audit(user.id, "inspection.update", "inspection", id, { status: updated.status });
  return json(updated);
});

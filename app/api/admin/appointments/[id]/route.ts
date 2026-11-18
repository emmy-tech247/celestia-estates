import { prisma } from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { appointmentUpdateSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const data = appointmentUpdateSchema.parse(await readJson(req));

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Appointment not found");

  // Changing the date without an explicit status counts as a reschedule.
  const status = data.status ?? (data.appointmentDate ? "RESCHEDULED" : undefined);
  const updated = await prisma.appointment.update({ where: { id }, data: { ...data, status } });

  await prisma.notification.create({
    data: { userId: existing.customerId, title: `Inspection ${updated.status.toLowerCase()}`, body: "Check your appointments for details." },
  });
  await audit(user.id, "appointment.update", "appointment", id, { status: updated.status });
  return json(updated);
});

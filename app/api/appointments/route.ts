import { prisma } from "@/lib/prisma";
import { handle, json, readJson, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validation";

export const POST = handle(async (req) => {
  const u = await requireUser("CUSTOMER");
  const data = appointmentSchema.parse(await readJson(req));

  const property = await prisma.property.findFirst({
    where: { id: data.propertyId, status: "PUBLISHED" },
    select: { id: true, agentId: true },
  });
  if (!property) throw new ApiError(404, "Property not found");
  if (!property.agentId) throw new ApiError(422, "No agent is assigned to this property yet. Please send an enquiry instead.");

  // Block double booking of the same agent within a 1-hour window.
  const start = new Date(data.appointmentDate.getTime() - 60 * 60_000);
  const end = new Date(data.appointmentDate.getTime() + 60 * 60_000);
  const clash = await prisma.appointment.findFirst({
    where: {
      agentId: property.agentId,
      status: { in: ["PENDING", "APPROVED", "RESCHEDULED"] },
      appointmentDate: { gt: start, lt: end },
    },
    select: { id: true },
  });
  if (clash) throw new ApiError(409, "That time is not available. Please choose another slot.");

  const appt = await prisma.appointment.create({
    data: {
      propertyId: property.id,
      customerId: u.id,
      agentId: property.agentId,
      appointmentDate: data.appointmentDate,
      notes: data.notes,
    },
  });
  await prisma.notification.create({
    data: { userId: property.agentId, title: "New inspection request", body: `Requested for ${data.appointmentDate.toISOString()}` },
  });
  return json(appt, 201);
});

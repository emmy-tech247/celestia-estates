import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { handle, json, readJson, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { inspectionSchema } from "@/lib/validation";
import { captureLead, changeStage } from "@/lib/leads";

// A customer books an inspection. This also creates (or updates) the CRM lead so sales can follow up.
export const POST = handle(async (req) => {
  const u = await requireUser("CUSTOMER");
  const data = inspectionSchema.parse(await readJson(req));
  const refCode = (await cookies()).get("celestia_ref")?.value ?? null;

  const { lead } = await captureLead({
    propertyId: data.propertyId,
    type: "INSPECTION_REQUEST",
    name: u.fullName,
    email: u.email,
    phone: u.phone ?? undefined,
    message: `Inspection requested for ${data.scheduledAt.toISOString()}${data.notes ? `. ${data.notes}` : ""}`,
    preferredDate: data.scheduledAt,
    customerId: u.id,
    refCode,
  });
  const agentId = lead.assignedAgentId;

  // Block double booking of the same agent within a 1-hour window.
  if (agentId) {
    const clash = await prisma.inspection.findFirst({
      where: {
        agentId,
        status: { in: ["PENDING", "APPROVED", "RESCHEDULED"] },
        scheduledAt: { gt: new Date(data.scheduledAt.getTime() - 3_600_000), lt: new Date(data.scheduledAt.getTime() + 3_600_000) },
      },
      select: { id: true },
    });
    if (clash) throw new ApiError(409, "That time is not available. Please choose another slot.");
  }

  const inspection = await prisma.inspection.create({
    data: { leadId: lead.id, propertyId: data.propertyId, customerId: u.id, agentId, scheduledAt: data.scheduledAt, notes: data.notes },
  });
  if (["NEW", "CONTACTED"].includes(lead.stage)) await changeStage(lead.id, "INSPECTION_SCHEDULED", null);
  if (agentId) {
    await prisma.notification.create({ data: { userId: agentId, title: "New inspection request", body: data.scheduledAt.toISOString() } });
  }
  return json(inspection, 201);
});

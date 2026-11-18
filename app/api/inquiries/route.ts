import { prisma } from "@/lib/prisma";
import { handle, json, readJson, ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { inquirySchema } from "@/lib/validation";
import { rateLimit } from "@/lib/utils";

// Public. An enquiry never changes a property's status (that needs a transaction workflow).
export const POST = handle(async (req) => {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`inquiry:${ip}`, 5, 10 * 60_000)) throw new ApiError(429, "Too many enquiries. Please try later.");

  const data = inquirySchema.parse(await readJson(req));
  const property = await prisma.property.findFirst({
    where: { id: data.propertyId, status: "PUBLISHED" },
    select: { id: true, agentId: true },
  });
  if (!property) throw new ApiError(404, "Property not found");

  const user = await getCurrentUser();
  const inquiry = await prisma.inquiry.create({
    data: { ...data, customerId: user?.id ?? null, assignedAgentId: property.agentId },
  });
  return json({ id: inquiry.id, status: inquiry.status }, 201);
});

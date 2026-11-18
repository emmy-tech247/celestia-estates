import { cookies } from "next/headers";
import { handle, json, readJson, ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { leadSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/utils";
import { captureLead } from "@/lib/leads";

// Public. Enquiry / callback / info request / WhatsApp contact all land here and enter the CRM.
// A lead never changes a property's status; only a completed transaction can.
export const POST = handle(async (req) => {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`lead:${ip}`, 5, 10 * 60_000)) throw new ApiError(429, "Too many enquiries. Please try later.");

  const data = leadSchema.parse(await readJson(req));
  const user = await getCurrentUser();
  const refCode = (await cookies()).get("celestia_ref")?.value ?? null;

  const { lead, created } = await captureLead({
    ...data,
    customerId: user?.role.name === "CUSTOMER" ? user.id : null,
    refCode,
  });
  return json({ id: lead.id, created }, created ? 201 : 200);
});

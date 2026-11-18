import { handle, json, ApiError } from "@/lib/api";
import { processDueFollowUps } from "@/lib/followups";

// Called on a schedule (see vercel.json). Vercel sends  Authorization: Bearer $CRON_SECRET.
export const GET = handle(async (req) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new ApiError(500, "CRON_SECRET is not set");
  if (req.headers.get("authorization") !== `Bearer ${secret}`) throw new ApiError(401, "Unauthorized");
  return json(await processDueFollowUps());
});

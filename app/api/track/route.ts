import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { handle, json, readJson } from "@/lib/api";
import { trackSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/utils";

// First-party analytics beacon. Never errors to the visitor.
export const POST = handle(async (req) => {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|slurp|preview/i.test(ua) || !rateLimit(`track:${ip}`, 120)) return json({ ok: true });

  const parsed = trackSchema.safeParse(await readJson(req).catch(() => ({})));
  if (!parsed.success) return json({ ok: true });
  const d = parsed.data;

  const code = (await cookies()).get("celestia_ref")?.value;
  const rc = code ? await prisma.referralCode.findUnique({ where: { code }, select: { id: true } }) : null;

  await prisma.analyticsEvent
    .create({ data: { type: d.type, sessionId: d.sessionId, path: d.path, propertyId: d.propertyId, referralCodeId: rc?.id } })
    .catch(() => null); // e.g. property deleted meanwhile
  return json({ ok: true });
});

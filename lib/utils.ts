import prisma from "./prisma";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 200);
}

export async function uniquePropertySlug(title: string) {
  const base = slugify(title) || "property";
  let slug = base;
  let n = 1;
  while (await prisma.property.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

export async function audit(
  userId: bigint | null,
  action: string,
  entityType: string,
  entityId?: bigint | string,
  metadata?: object
) {
  await prisma.auditLog.create({
    data: { userId, action, entityType, entityId: entityId?.toString(), metadata },
  });
}

/** Minimal in-memory limiter. Use Redis/Upstash in production (serverless instances don't share memory). */
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

/** Normalises a Nigerian phone number to its last 10 digits for duplicate detection. */
export function normalizePhone(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
}

export const money = (n: unknown) => Math.round(Number(n) * 100) / 100;

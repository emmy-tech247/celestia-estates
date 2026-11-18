import prisma from "@/lib/prisma";
import { handle, json, readJson, ApiError } from "@/lib/api";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/utils";

export const POST = handle(async (req) => {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { email, password } = loginSchema.parse(await readJson(req));

  if (!rateLimit(`login:${ip}:${email}`, 5)) {
    throw new ApiError(429, "Too many login attempts. Try again in a minute.");
  }

  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  // Same message for unknown email and wrong password, to avoid account enumeration.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (user.status !== "ACTIVE") throw new ApiError(403, "This account is not active");

  await createSession(user.id, user.role.name);
  return json({ user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role.name } });
});

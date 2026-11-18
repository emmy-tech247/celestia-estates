import prisma from "@/lib/prisma";
import { handle, json, readJson, ApiError } from "@/lib/api";
import { hashPassword, createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/utils";

export const POST = handle(async (req) => {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`register:${ip}`, 5)) throw new ApiError(429, "Too many attempts. Try again shortly.");

  const data = registerSchema.parse(await readJson(req));

  if (await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } })) {
    throw new ApiError(409, "An account with this email already exists");
  }

  // Public registration always creates a CUSTOMER. Staff are created by admins only.
  const role = await prisma.role.findUniqueOrThrow({ where: { name: "CUSTOMER" } });
  const user = await prisma.user.create({
    data: {
      roleId: role.id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash: await hashPassword(data.password),
    },
  });

  await createSession(user.id, "CUSTOMER");
  return json({ user: { id: user.id, fullName: user.fullName, email: user.email, role: "CUSTOMER" } }, 201);
});

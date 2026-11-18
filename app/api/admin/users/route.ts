import prisma from "@/lib/prisma";
import { handle, json, readJson, ApiError } from "@/lib/api";
import { requireUser, hashPassword } from "@/lib/auth";
import { createUserSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";

const userSelect = {
  id: true, fullName: true, email: true, phone: true, status: true, createdAt: true,
  role: { select: { name: true } },
} as const;

export const GET = handle(async (req) => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  const role = new URL(req.url).searchParams.get("role");
  const items = await prisma.user.findMany({
    where: role ? { role: { name: role.toUpperCase() as "AGENT" } } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    select: userSelect,
  });
  return json({ items });
});

export const POST = handle(async (req) => {
  const admin = await requireUser("SUPER_ADMIN", "MANAGER");
  const data = createUserSchema.parse(await readJson(req));

  // Managers can add agents and customers; only a Super Admin can create managers.
  if (admin.role.name === "MANAGER" && data.role === "MANAGER") {
    throw new ApiError(403, "Only a Super Admin can create managers");
  }
  if (await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } })) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const role = await prisma.role.findUniqueOrThrow({ where: { name: data.role } });
  const user = await prisma.user.create({
    data: {
      roleId: role.id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash: await hashPassword(data.password),
    },
    select: userSelect,
  });
  await audit(admin.id, "user.create", "user", user.id, { role: data.role });
  return json(user, 201);
});

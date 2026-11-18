import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { updateUserSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";

const select = {
  id: true, fullName: true, email: true, phone: true, status: true,
  role: { select: { name: true } },
} as const;

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const { role, ...rest } = updateUserSchema.parse(await readJson(req));

  const target = await prisma.user.findUnique({ where: { id }, include: { role: true } });
  if (!target) throw new ApiError(404, "User not found");

  if (target.role.name === "SUPER_ADMIN") throw new ApiError(403, "Super Admin accounts cannot be modified here");
  if (admin.role.name === "MANAGER" && (target.role.name === "MANAGER" || role === "MANAGER")) {
    throw new ApiError(403, "Only a Super Admin can manage managers");
  }
  if (id === admin.id && (rest.status || role)) throw new ApiError(400, "You cannot change your own role or status");

  const roleRow = role ? await prisma.role.findUniqueOrThrow({ where: { name: role } }) : null;
  const updated = await prisma.user.update({
    where: { id },
    data: { ...rest, ...(roleRow ? { roleId: roleRow.id } : {}) },
    select,
  });
  await audit(admin.id, "user.update", "user", id, { ...rest, role });
  return json(updated);
});

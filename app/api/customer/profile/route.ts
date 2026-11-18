import prisma from "@/lib/prisma";
import { handle, json, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";

const select = { id: true, fullName: true, email: true, phone: true, profileImage: true, createdAt: true } as const;

export const GET = handle(async () => {
  const u = await requireUser("CUSTOMER");
  return json(await prisma.user.findUnique({ where: { id: u.id }, select }));
});

export const PATCH = handle(async (req) => {
  const u = await requireUser("CUSTOMER");
  const data = profileSchema.parse(await readJson(req));
  return json(await prisma.user.update({ where: { id: u.id }, data, select }));
});

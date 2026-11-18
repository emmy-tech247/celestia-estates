import { z } from "zod";
import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/utils";

const patch = z.object({ isActive: z.boolean().optional(), priority: z.coerce.number().int().optional(), name: z.string().trim().min(3).max(150).optional() });

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireUser("SUPER_ADMIN");
  const id = parseId((await ctx.params).id);
  const rule = await prisma.commissionRule.update({ where: { id }, data: patch.parse(await readJson(req)) });
  await audit(admin.id, "commission_rule.update", "commission_rule", id);
  return json(rule);
});

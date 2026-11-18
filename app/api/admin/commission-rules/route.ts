import prisma from "@/lib/prisma";
import { handle, json, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { commissionRuleSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";

export const GET = handle(async () => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  return json({ items: await prisma.commissionRule.findMany({ orderBy: [{ priority: "desc" }, { id: "asc" }], include: { category: true } }) });
});

// Rules change what the company pays out, so only a Super Admin may create them.
export const POST = handle(async (req) => {
  const admin = await requireUser("SUPER_ADMIN");
  const data = commissionRuleSchema.parse(await readJson(req));
  const rule = await prisma.commissionRule.create({ data });
  await audit(admin.id, "commission_rule.create", "commission_rule", rule.id);
  return json(rule, 201);
});

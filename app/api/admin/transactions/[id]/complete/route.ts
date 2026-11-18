import { handle, json, readJson, parseId } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { completeTransactionSchema } from "@/lib/validation";
import { completeTransaction } from "@/lib/transactions";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireUser("SUPER_ADMIN", "MANAGER");
  const { agencyCommission } = completeTransactionSchema.parse(await readJson(req).catch(() => ({})));
  const { transaction, commissionId, warning } = await completeTransaction(parseId((await ctx.params).id), admin.id, agencyCommission);
  return json({ transaction, commissionId, warning });
});

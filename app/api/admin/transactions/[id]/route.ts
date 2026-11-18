import { handle, json, parseId } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { cancelTransaction } from "@/lib/transactions";

// DELETE cancels (never hard-deletes) a transaction and releases the property.
export const DELETE = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireUser("SUPER_ADMIN", "MANAGER");
  return json(await cancelTransaction(parseId((await ctx.params).id), admin.id));
});

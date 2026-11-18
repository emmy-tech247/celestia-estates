import type { Prisma, TransactionType } from "@prisma/client";
import { money } from "./utils";

export type CommissionResult = { ruleId: bigint; amount: number } | "NO_RULE" | "NEEDS_AGENCY_COMMISSION";

/**
 * Picks the highest-priority active rule matching the transaction and computes the reward.
 * Percentage rules can be based on the agency's actual commission (the safer default) or on the property value.
 */
export async function computeCommission(
  tx: Prisma.TransactionClient,
  t: { transactionType: TransactionType; amount: number; agencyCommission: number | null; categoryId: bigint }
): Promise<CommissionResult> {
  const rules = await tx.commissionRule.findMany({ where: { isActive: true }, orderBy: [{ priority: "desc" }, { id: "asc" }] });

  const rule = rules.find(
    (r) =>
      (!r.transactionType || r.transactionType === t.transactionType) &&
      (!r.categoryId || r.categoryId === t.categoryId) &&
      (r.minPropertyValue === null || t.amount >= Number(r.minPropertyValue)) &&
      (r.maxPropertyValue === null || t.amount <= Number(r.maxPropertyValue))
  );
  if (!rule) return "NO_RULE";

  const needsPct = rule.calcType !== "FIXED";
  let base = 0;
  if (needsPct) {
    if (rule.base === "AGENCY_COMMISSION") {
      if (t.agencyCommission === null) return "NEEDS_AGENCY_COMMISSION";
      base = t.agencyCommission;
    } else base = t.amount;
  }
  const fixed = rule.calcType !== "PERCENTAGE" ? Number(rule.fixedAmount ?? 0) : 0;
  const pct = needsPct ? (base * Number(rule.percentage ?? 0)) / 100 : 0;
  return { ruleId: rule.id, amount: money(fixed + pct) };
}

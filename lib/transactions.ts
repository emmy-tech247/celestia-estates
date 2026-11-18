import type { z } from "zod";
import prisma from "./prisma";
import { ApiError } from "./api";
import { audit } from "./utils";
import { dealTypeFor } from "./leads";
import { computeCommission } from "./commissions";
import type { transactionCreateSchema } from "./validation";

type CreateInput = z.infer<typeof transactionCreateSchema>;

export async function createTransaction(input: CreateInput, userId: bigint) {
  const lead = input.leadId
    ? await prisma.lead.findUnique({ where: { id: input.leadId } })
    : null;
  if (input.leadId && !lead) throw new ApiError(404, "Lead not found");

  const propertyId = input.propertyId ?? lead?.propertyId;
  if (!propertyId) throw new ApiError(422, "Provide a propertyId, or a lead that is linked to a property");

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new ApiError(404, "Property not found");
  if (["SOLD", "RENTED", "ARCHIVED"].includes(property.status)) throw new ApiError(409, "This property is no longer available");

  const open = await prisma.transaction.findFirst({ where: { propertyId, status: { in: ["PENDING", "APPROVED"] } }, select: { id: true } });
  if (open) throw new ApiError(409, `Property already has an open transaction (#${open.id})`);

  const buyerName = input.buyerName ?? lead?.name;
  if (!buyerName) throw new ApiError(422, "buyerName is required when no lead is supplied");

  const txn = await prisma.$transaction(async (tx) => {
    let dealId: bigint | undefined;
    if (lead) {
      const deal = await tx.deal.findFirst({ where: { leadId: lead.id, status: "OPEN" } });
      dealId = deal
        ? deal.id
        : (await tx.deal.create({
            data: {
              leadId: lead.id, propertyId, customerId: lead.customerId, agentId: lead.assignedAgentId,
              dealType: dealTypeFor(property.listingType), agreedAmount: input.amount,
            },
          })).id;
      await tx.deal.update({ where: { id: dealId }, data: { agreedAmount: input.amount } });
      await tx.lead.update({ where: { id: lead.id }, data: { stage: "PAYMENT_PROCESSING" } });
      await tx.leadActivity.create({ data: { leadId: lead.id, userId, type: "STAGE_CHANGE", body: `${lead.stage} -> PAYMENT_PROCESSING (transaction opened)` } });
    }
    const created = await tx.transaction.create({
      data: {
        dealId, propertyId,
        customerId: input.customerId ?? lead?.customerId ?? null,
        agentId: lead?.assignedAgentId ?? property.agentId,
        buyerName,
        buyerEmail: input.buyerEmail ?? lead?.email,
        buyerPhone: input.buyerPhone ?? lead?.phone,
        transactionType: input.transactionType ?? dealTypeFor(property.listingType),
        amount: input.amount,
        currency: property.currency,
      },
    });
    if (property.status === "PUBLISHED") await tx.property.update({ where: { id: propertyId }, data: { status: "RESERVED" } });
    return created;
  });

  await audit(userId, "transaction.create", "transaction", txn.id, { amount: input.amount });
  return txn;
}

export async function cancelTransaction(id: bigint, userId: bigint) {
  const t = await prisma.transaction.findUnique({ where: { id } });
  if (!t) throw new ApiError(404, "Transaction not found");
  if (t.status === "COMPLETED") throw new ApiError(409, "A completed transaction cannot be cancelled");
  if (t.status === "CANCELLED") return t;

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.transaction.update({ where: { id }, data: { status: "CANCELLED" } });
    await tx.property.updateMany({ where: { id: t.propertyId, status: "RESERVED" }, data: { status: "PUBLISHED" } });
    return u;
  });
  await audit(userId, "transaction.cancel", "transaction", id);
  return updated;
}

/**
 * The only path to "sold"/"rented". Requires payments received to cover the amount,
 * then marks the property, deal and lead, and creates a PENDING commission if the lead
 * was introduced by a referral partner.
 */
export async function completeTransaction(id: bigint, userId: bigint, agencyCommission?: number) {
  const result = await prisma.$transaction(async (tx) => {
    const t = await tx.transaction.findUnique({
      where: { id },
      include: { property: { select: { categoryId: true } }, deal: true, payments: { where: { status: "SUCCESSFUL" } } },
    });
    if (!t) throw new ApiError(404, "Transaction not found");
    if (t.status === "COMPLETED") throw new ApiError(409, "Transaction is already completed");
    if (t.status === "CANCELLED") throw new ApiError(409, "Transaction was cancelled");

    const paid = t.payments.reduce((s, p) => s + Number(p.amount), 0);
    if (paid + 0.005 < Number(t.amount)) {
      throw new ApiError(422, `Payments received (${paid.toLocaleString()}) are less than the transaction amount (${Number(t.amount).toLocaleString()})`);
    }

    const agency = agencyCommission ?? (t.agencyCommission === null ? null : Number(t.agencyCommission));
    const leadId = t.deal?.leadId ?? null;
    const attribution = leadId ? await tx.referralAttribution.findUnique({ where: { leadId } }) : null;

    let commissionId: bigint | null = null;
    let warning: string | undefined;
    if (attribution && attribution.status === "PENDING") {
      const calc = await computeCommission(tx, {
        transactionType: t.transactionType, amount: Number(t.amount), agencyCommission: agency, categoryId: t.property.categoryId,
      });
      if (calc === "NEEDS_AGENCY_COMMISSION") {
        throw new ApiError(422, "The matching commission rule is based on the agency commission. Provide agencyCommission to complete this transaction.");
      }
      if (calc === "NO_RULE") warning = "No commission rule matched, so no referral commission was created.";
      else {
        const c = await tx.commission.create({
          data: { partnerId: attribution.partnerId, attributionId: attribution.id, transactionId: t.id, ruleId: calc.ruleId, amount: calc.amount },
        });
        commissionId = c.id;
      }
      await tx.referralAttribution.update({ where: { id: attribution.id }, data: { status: "CONVERTED" } });
    }

    const completed = await tx.transaction.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date(), agencyCommission: agency },
    });
    await tx.property.update({ where: { id: t.propertyId }, data: { status: t.transactionType === "SALE" ? "SOLD" : "RENTED" } });
    if (t.dealId) await tx.deal.update({ where: { id: t.dealId }, data: { status: "WON", closedAt: new Date() } });
    if (leadId) {
      await tx.lead.update({ where: { id: leadId }, data: { stage: "WON" } });
      await tx.leadActivity.create({ data: { leadId, userId, type: "STAGE_CHANGE", body: `Won: transaction #${id} completed` } });
    }
    return { transaction: completed, commissionId, warning };
  });

  await audit(userId, "transaction.complete", "transaction", id, { commissionId: result.commissionId?.toString() ?? null });
  return result;
}

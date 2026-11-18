import type { LeadStage, LeadType, ListingType, Prisma, TransactionType } from "@prisma/client";
import prisma from "./prisma";
import { ApiError } from "./api";
import { normalizePhone } from "./utils";
import { escapeHtml, sendLoggedEmail } from "./email";
import { absoluteUrl } from "./seo";

export type LeadInput = {
  propertyId?: bigint;
  type: LeadType;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  preferredDate?: Date;
  customerId?: bigint | null;
  refCode?: string | null;
  utmSource?: string; utmMedium?: string; utmCampaign?: string;
};

export const dealTypeFor = (t: ListingType): TransactionType => (t === "SALE" ? "SALE" : t === "RENT" ? "RENTAL" : "LEASE");

/** Round-robin by workload: the active agent with the fewest open leads. */
export async function pickAgent(): Promise<bigint | null> {
  const agents = await prisma.user.findMany({
    where: { role: { name: "AGENT" }, status: "ACTIVE" },
    select: { id: true, _count: { select: { assignedLeads: { where: { stage: { notIn: ["WON", "LOST"] } } } } } },
  });
  if (!agents.length) return null;
  agents.sort((a, b) => a._count.assignedLeads - b._count.assignedLeads);
  return agents[0].id;
}

/**
 * Single entry point for every enquiry / callback / inspection request.
 *  - de-duplicates: a repeat enquiry from an open lead is logged on that lead, not duplicated
 *  - assigns an agent (the property's agent, else least-busy agent)
 *  - records referral ownership (first touch), rejecting self-referrals and already-known contacts
 *  - schedules the automated follow-up sequence
 */
export async function captureLead(input: LeadInput) {
  const emailNorm = input.email.trim().toLowerCase();
  const phoneNorm = normalizePhone(input.phone);
  const contact: Prisma.LeadWhereInput[] = [{ emailNorm }];
  if (phoneNorm) contact.push({ phoneNorm });

  let property: { id: bigint; title: string; slug: string; agentId: bigint | null } | null = null;
  if (input.propertyId) {
    property = await prisma.property.findFirst({
      where: { id: input.propertyId, status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, agentId: true },
    });
    if (!property) throw new ApiError(404, "Property not found");
  }

  // 1. Repeat enquiry from a lead that is still open -> add to its timeline.
  const open = await prisma.lead.findFirst({
    where: { OR: contact, stage: { notIn: ["WON", "LOST"] } },
    orderBy: { createdAt: "desc" },
  });
  if (open) {
    await prisma.leadActivity.create({
      data: {
        leadId: open.id,
        type: "REPEAT_ENQUIRY",
        body: `Repeat ${input.type.toLowerCase()}${property ? ` about "${property.title}"` : ""}${input.message ? `: ${input.message}` : ""}`,
        metadata: { propertyId: property?.id.toString() ?? null },
      },
    });
    await prisma.lead.update({
      where: { id: open.id },
      data: {
        ...(input.customerId && !open.customerId ? { customerId: input.customerId } : {}),
        ...(property && !open.propertyId ? { propertyId: property.id } : {}),
      },
    });
    return { lead: open, created: false };
  }

  // 2. Referral ownership.
  const priorLeads = await prisma.lead.count({ where: { OR: contact } });
  let attribution: { partnerId: bigint; codeId: bigint; status: "PENDING" | "REJECTED"; reason?: string } | null = null;
  if (input.refCode) {
    const rc = await prisma.referralCode.findFirst({
      where: { code: input.refCode.toUpperCase(), isActive: true, partner: { status: "APPROVED" } },
      include: { partner: { include: { user: { select: { email: true, phone: true } } } } },
    });
    if (rc) {
      const partnerUser = rc.partner.user;
      const isSelf =
        partnerUser.email.toLowerCase() === emailNorm || (!!phoneNorm && normalizePhone(partnerUser.phone) === phoneNorm);
      attribution = isSelf
        ? { partnerId: rc.partnerId, codeId: rc.id, status: "REJECTED", reason: "Self-referral" }
        : priorLeads > 0
          ? { partnerId: rc.partnerId, codeId: rc.id, status: "REJECTED", reason: "Contact already known to the company" }
          : { partnerId: rc.partnerId, codeId: rc.id, status: "PENDING" };
    }
  }

  // 3. Create the lead, assignment, timeline entry, follow-up schedule and attribution together.
  const agentId = property?.agentId ?? (await pickAgent());
  const lead = await prisma.$transaction(async (tx) => {
    const created = await tx.lead.create({
      data: {
        propertyId: property?.id,
        customerId: input.customerId ?? null,
        assignedAgentId: agentId,
        type: input.type,
        source: attribution?.status === "PENDING" ? "REFERRAL" : input.type === "WHATSAPP" ? "WHATSAPP" : "WEBSITE",
        name: input.name,
        email: input.email,
        phone: input.phone,
        emailNorm,
        phoneNorm,
        message: input.message,
        preferredDate: input.preferredDate,
        utmSource: input.utmSource, utmMedium: input.utmMedium, utmCampaign: input.utmCampaign,
      },
    });
    await tx.leadActivity.create({
      data: { leadId: created.id, type: "SYSTEM", body: `Lead created (${input.type.toLowerCase()})${property ? ` for "${property.title}"` : ""}` },
    });
    if (agentId) await tx.leadAssignment.create({ data: { leadId: created.id, agentId } });

    const now = Date.now();
    const hours = (h: number) => new Date(now + h * 3_600_000);
    await tx.followUpTask.createMany({
      data: [
        { leadId: created.id, kind: "AGENT_NOTIFY", scheduledFor: hours(1) },
        { leadId: created.id, kind: "CUSTOMER_FOLLOWUP", scheduledFor: hours(24) },
        { leadId: created.id, kind: "RECOMMENDATIONS", scheduledFor: hours(72) },
        { leadId: created.id, kind: "STILL_INTERESTED", scheduledFor: hours(168) },
      ],
    });
    if (attribution) {
      await tx.referralAttribution.create({
        data: { partnerId: attribution.partnerId, codeId: attribution.codeId, leadId: created.id, status: attribution.status, rejectionReason: attribution.reason },
      });
    }
    return created;
  });

  // 4. Immediate notifications (best effort: a mail failure must not lose the lead).
  if (agentId) {
    await prisma.notification
      .create({ data: { userId: agentId, title: "New lead assigned", body: `${input.name}${property ? ` · ${property.title}` : ""}` } })
      .catch(() => null);
  }
  await sendLoggedEmail({
    to: input.email,
    subject: "We received your enquiry - Celestia Estates",
    template: "lead_confirmation",
    leadId: lead.id,
    html: `<p>Hello ${escapeHtml(input.name)},</p>
      <p>Thank you for contacting Celestia Estates${property ? ` about <strong>${escapeHtml(property.title)}</strong>` : ""}. One of our agents will be in touch shortly.</p>
      ${property ? `<p><a href="${absoluteUrl(`/properties/${property.slug}`)}">View the property again</a></p>` : ""}`,
  });

  return { lead, created: true };
}

/** Moves a lead through the pipeline, keeping deals, attribution and the timeline consistent. */
export async function changeStage(leadId: bigint, stage: LeadStage, userId: bigint | null, lostReason?: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, include: { property: { select: { listingType: true } } } });
  if (!lead) throw new ApiError(404, "Lead not found");
  if (lead.stage === "WON") throw new ApiError(409, "This lead is already won and cannot be changed");
  if (lead.stage === stage) return lead;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.lead.update({
      where: { id: leadId },
      data: { stage, lostReason: stage === "LOST" ? lostReason ?? null : null, ...(stage !== "NEW" ? { lastContactedAt: new Date() } : {}) },
    });
    await tx.leadActivity.create({
      data: { leadId, userId, type: "STAGE_CHANGE", body: `${lead.stage} -> ${stage}${stage === "LOST" && lostReason ? ` (${lostReason})` : ""}` },
    });

    if (stage === "NEGOTIATION" && lead.propertyId && lead.property) {
      const existing = await tx.deal.findFirst({ where: { leadId, status: "OPEN" } });
      if (!existing) {
        await tx.deal.create({
          data: {
            leadId, propertyId: lead.propertyId, customerId: lead.customerId, agentId: lead.assignedAgentId,
            dealType: dealTypeFor(lead.property.listingType),
          },
        });
      }
    }
    if (stage === "LOST") {
      await tx.deal.updateMany({ where: { leadId, status: "OPEN" }, data: { status: "LOST", closedAt: new Date() } });
      await tx.referralAttribution.updateMany({ where: { leadId, status: "PENDING" }, data: { status: "REJECTED", rejectionReason: "Lead lost" } });
    } else if (lead.stage === "LOST") {
      await tx.referralAttribution.updateMany({ where: { leadId, rejectionReason: "Lead lost" }, data: { status: "PENDING", rejectionReason: null } });
    }
    return updated;
  });
}

export async function reassignLead(leadId: bigint, agentId: bigint | null, byUserId: bigint) {
  if (agentId) {
    const agent = await prisma.user.findFirst({ where: { id: agentId, role: { name: "AGENT" }, status: "ACTIVE" }, select: { id: true } });
    if (!agent) throw new ApiError(422, "Assigned user is not an active agent");
  }
  await prisma.$transaction(async (tx) => {
    await tx.lead.update({ where: { id: leadId }, data: { assignedAgentId: agentId } });
    if (agentId) await tx.leadAssignment.create({ data: { leadId, agentId, assignedById: byUserId } });
    await tx.leadActivity.create({ data: { leadId, userId: byUserId, type: "ASSIGNMENT", body: agentId ? `Assigned to agent #${agentId}` : "Unassigned" } });
  });
  if (agentId) {
    await prisma.notification.create({ data: { userId: agentId, title: "A lead was assigned to you", body: `Lead #${leadId}` } }).catch(() => null);
  }
}

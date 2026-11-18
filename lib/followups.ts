import prisma from "./prisma";
import { escapeHtml, sendLoggedEmail } from "./email";
import { absoluteUrl } from "./seo";
import { formatPrice } from "./format";

type Outcome = "DONE" | "SKIPPED";

/** Runs due follow-up tasks. Each task is claimed atomically so overlapping cron runs never double-send. */
export async function processDueFollowUps(limit = 50) {
  const due = await prisma.followUpTask.findMany({
    where: { status: "SCHEDULED", scheduledFor: { lte: new Date() } },
    orderBy: { scheduledFor: "asc" },
    take: limit,
    include: {
      lead: {
        include: {
          property: { select: { id: true, title: true, slug: true, categoryId: true, location: { select: { city: true, state: true } } } },
          assignedAgent: { select: { id: true, email: true, fullName: true } },
        },
      },
    },
  });

  const result = { processed: 0, done: 0, skipped: 0, failed: 0 };
  for (const task of due) {
    const claim = await prisma.followUpTask.updateMany({
      where: { id: task.id, status: "SCHEDULED" },
      data: { status: "DONE", executedAt: new Date() },
    });
    if (claim.count === 0) continue; // another run took it
    result.processed++;

    try {
      const { lead } = task;
      let outcome: Outcome = "DONE";
      const closed = lead.stage === "WON" || lead.stage === "LOST";

      if (closed) outcome = "SKIPPED";
      else if (task.kind === "AGENT_NOTIFY") {
        if (lead.stage !== "NEW" || !lead.assignedAgent) outcome = "SKIPPED";
        else {
          await prisma.notification.create({
            data: { userId: lead.assignedAgent.id, title: "Lead waiting for first contact", body: `${lead.name} enquired over an hour ago.` },
          });
          await sendLoggedEmail({
            to: lead.assignedAgent.email, template: "agent_reminder", leadId: lead.id, userId: lead.assignedAgent.id,
            subject: `Reminder: contact ${lead.name}`,
            html: `<p>${escapeHtml(lead.name)} (${escapeHtml(lead.email)}${lead.phone ? `, ${escapeHtml(lead.phone)}` : ""}) enquired over an hour ago and has not been contacted yet.</p>`,
          });
        }
      } else if (task.kind === "CUSTOMER_FOLLOWUP") {
        await sendLoggedEmail({
          to: lead.email, template: "followup_24h", leadId: lead.id,
          subject: "Still looking? We're here to help",
          html: `<p>Hello ${escapeHtml(lead.name)},</p><p>Just checking in on your enquiry${lead.property ? ` about <strong>${escapeHtml(lead.property.title)}</strong>` : ""}. Reply to this email or book an inspection and we'll arrange it.</p>`,
        });
      } else if (task.kind === "RECOMMENDATIONS") {
        const similar = await prisma.property.findMany({
          where: {
            status: "PUBLISHED",
            ...(lead.property ? { id: { not: lead.property.id }, categoryId: lead.property.categoryId, location: { city: lead.property.location.city } } : {}),
          },
          orderBy: lead.property ? { createdAt: "desc" } : { isFeatured: "desc" },
          take: 3,
          select: { title: true, slug: true, price: true, currency: true, listingType: true },
        });
        if (similar.length === 0) outcome = "SKIPPED";
        else {
          const items = similar
            .map((p) => `<li><a href="${absoluteUrl(`/properties/${p.slug}`)}">${escapeHtml(p.title)}</a> · ${formatPrice(p.price, p.currency, p.listingType)}</li>`)
            .join("");
          await sendLoggedEmail({
            to: lead.email, template: "recommendations", leadId: lead.id,
            subject: "Properties you may like",
            html: `<p>Hello ${escapeHtml(lead.name)},</p><p>Based on your enquiry, here are a few properties you might like:</p><ul>${items}</ul>`,
          });
        }
      } else if (task.kind === "STILL_INTERESTED") {
        await sendLoggedEmail({
          to: lead.email, template: "still_interested", leadId: lead.id,
          subject: "Are you still interested?",
          html: `<p>Hello ${escapeHtml(lead.name)},</p><p>It has been a week since your enquiry. Are you still interested? Just reply and an agent will pick things up.</p>`,
        });
      }

      if (outcome === "SKIPPED") {
        await prisma.followUpTask.update({ where: { id: task.id }, data: { status: "SKIPPED" } });
        result.skipped++;
      } else result.done++;
    } catch (e) {
      await prisma.followUpTask.update({
        where: { id: task.id },
        data: { status: "FAILED", error: e instanceof Error ? e.message.slice(0, 250) : "Unknown error" },
      });
      result.failed++;
    }
  }
  return result;
}

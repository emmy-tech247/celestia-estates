import type { LeadStage } from "@prisma/client";
import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async (req) => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  const sp = new URL(req.url).searchParams;
  const stage = sp.get("stage");
  const items = await prisma.lead.findMany({
    where: { ...(stage ? { stage: stage.toUpperCase() as LeadStage } : {}), ...(sp.get("agentId") ? { assignedAgentId: BigInt(sp.get("agentId")!) } : {}) },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      property: { select: { title: true, slug: true } },
      assignedAgent: { select: { id: true, fullName: true } },
      attribution: { select: { status: true, partner: { select: { user: { select: { fullName: true } } } } } },
    },
  });
  return json({ items });
});

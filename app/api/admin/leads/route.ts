
import prisma from "@/lib/prisma";
import { handle, json, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { STAGES } from "@/lib/validation";

export const GET = handle(async (req) => {
  await requireUser("SUPER_ADMIN", "MANAGER");

  const sp = new URL(req.url).searchParams;
  const stage = sp.get("stage");
  const agentIdParam = sp.get("agentId");

  if (stage && !STAGES.includes(stage.toUpperCase() as (typeof STAGES)[number])) {
    throw new ApiError(400, "Invalid lead stage");
  }

  let agentId: bigint | undefined;

  if (agentIdParam) {
    if (!/^\d+$/.test(agentIdParam)) {
      throw new ApiError(400, "Invalid agent ID");
    }

    agentId = BigInt(agentIdParam);
  }

  const items = await prisma.lead.findMany({
    where: {
      ...(stage
        ? { stage: stage.toUpperCase() as (typeof STAGES)[number] }
        : {}),
      ...(agentId !== undefined ? { assignedAgentId: agentId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      property: {
        select: { title: true, slug: true },
      },
      assignedAgent: {
        select: { id: true, fullName: true },
      },
      attribution: {
        select: {
          status: true,
          partner: {
            select: {
              user: {
                select: { fullName: true },
              },
            },
          },
        },
      },
    },
  });

  return json({ items });
});

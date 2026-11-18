import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  const u = await requireUser("AGENT");
  const items = await prisma.property.findMany({
    where: { agentId: u.id },
    orderBy: { createdAt: "desc" },
    include: { location: true, images: { where: { isPrimary: true }, take: 1 } },
  });
  return json({ items });
});

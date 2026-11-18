import { prisma } from "@/lib/prisma";
import { handle, json } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const GET = handle(async () => {
  const u = await requireUser("AGENT");
  const items = await prisma.appointment.findMany({
    where: { agentId: u.id },
    orderBy: { appointmentDate: "asc" },
    include: {
      property: { select: { title: true } },
      customer: { select: { fullName: true, phone: true, email: true } },
    },
  });
  return json({ items });
});

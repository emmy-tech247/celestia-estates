import prisma from "@/lib/prisma";
import { handle, json } from "@/lib/api";

export const GET = handle(async () => {
  return json({ items: await prisma.propertyCategory.findMany({ orderBy: { name: "asc" } }) });
});

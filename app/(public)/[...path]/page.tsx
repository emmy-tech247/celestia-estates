import { notFound, permanentRedirect, redirect } from "next/navigation";
import prisma from "@/lib/prisma";

// Any URL that no other route handles lands here: apply admin-managed redirects, otherwise 404.
export default async function CatchAll({ params }: { params: Promise<{ path: string[] }> }) {
  const fromPath = "/" + (await params).path.map(decodeURIComponent).join("/");
  const r = await prisma.redirect.findUnique({ where: { fromPath } });
  if (!r) notFound();
  await prisma.redirect.update({ where: { id: r.id }, data: { hits: { increment: 1 } } }).catch(() => null);
  if (r.statusCode === 301 || r.statusCode === 308) permanentRedirect(r.toPath);
  redirect(r.toPath);
}

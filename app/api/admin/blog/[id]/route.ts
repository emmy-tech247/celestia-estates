import prisma from "@/lib/prisma";
import { handle, json, readJson, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { blogUpdateSchema } from "@/lib/validation";
import { audit } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handle(async (req, ctx: Ctx) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  const data = blogUpdateSchema.parse(await readJson(req));
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Post not found");

  const post = await prisma.blogPost.update({
    where: { id },
    data: { ...data, ...(data.status === "PUBLISHED" && !existing.publishedAt ? { publishedAt: new Date() } : {}) },
  });
  await audit(user.id, "blog.update", "blog_post", id);
  return json(post);
});

export const DELETE = handle(async (_req, ctx: Ctx) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER");
  const id = parseId((await ctx.params).id);
  await prisma.blogPost.delete({ where: { id } }).catch(() => { throw new ApiError(404, "Post not found"); });
  await audit(user.id, "blog.delete", "blog_post", id);
  return json({ ok: true });
});

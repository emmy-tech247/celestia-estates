import prisma from "@/lib/prisma";
import { handle, json, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { blogSchema } from "@/lib/validation";
import { slugify, audit } from "@/lib/utils";

export const GET = handle(async () => {
  await requireUser("SUPER_ADMIN", "MANAGER");
  return json({ items: await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } }) });
});

export const POST = handle(async (req) => {
  const user = await requireUser("SUPER_ADMIN", "MANAGER");
  const data = blogSchema.parse(await readJson(req));

  const base = slugify(data.title) || "post";
  let slug = base;
  for (let n = 2; await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } }); n++) slug = `${base}-${n}`;

  const post = await prisma.blogPost.create({
    data: { ...data, slug, authorId: user.id, publishedAt: data.status === "PUBLISHED" ? new Date() : null },
  });
  await audit(user.id, "blog.create", "blog_post", post.id);
  return json(post, 201);
});

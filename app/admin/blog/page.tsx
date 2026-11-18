import prisma from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import ActionButton from "@/components/admin/ActionButton";
import BlogForm from "@/components/admin/BlogForm";
import { formatDate } from "@/lib/format";

export default async function AdminBlog() {
  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="space-y-6">
      <BlogForm categories={categories.map((c) => ({ id: c.id.toString(), name: c.name }))} />
      <div className="card divide-y divide-slate-100">
        {posts.length === 0 && <p className="p-8 text-center text-slate-500">No posts yet.</p>}
        {posts.map((p) => (
          <div key={p.id.toString()} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div><p className="font-medium">{p.title}</p><p className="text-xs text-slate-500">/blog/{p.slug} · {formatDate(p.createdAt)}</p></div>
            <div className="flex items-center gap-2">
              <Badge value={p.status} />
              <ActionButton url={`/api/admin/blog/${p.id}`} method="PATCH" body={{ status: p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }} label={p.status === "PUBLISHED" ? "Unpublish" : "Publish"} />
              <ActionButton url={`/api/admin/blog/${p.id}`} method="DELETE" label="Delete" tone="danger" confirmText="Delete this post?" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

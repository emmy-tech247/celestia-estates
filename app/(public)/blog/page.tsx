import Link from "next/link";
import prisma from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";

export async function generateMetadata() {
  return buildMetadata("PAGE", "/blog", {
    title: "Real estate guides and news",
    description: "Practical guides on buying, renting and investing in property in Nigeria.",
    path: "/blog",
  });
}

export default async function BlogIndex() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 30,
    include: { category: true },
  });
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand">Guides &amp; news</h1>
      {posts.length === 0 ? (
        <p className="card mt-8 p-10 text-center text-slate-500">No articles yet. Check back soon.</p>
      ) : (
        <div className="mt-8 space-y-5">
          {posts.map((p) => (
            <Link key={p.id.toString()} href={`/blog/${p.slug}`} className="card block p-6 transition hover:shadow-md">
              {p.category && <p className="text-xs font-medium uppercase tracking-wide text-gold">{p.category.name}</p>}
              <h2 className="mt-1 text-xl font-semibold text-brand">{p.title}</h2>
              {p.excerpt && <p className="mt-2 text-slate-600">{p.excerpt}</p>}
              {p.publishedAt && <p className="mt-3 text-xs text-slate-400">{formatDate(p.publishedAt)}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

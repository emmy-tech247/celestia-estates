import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { absoluteUrl, buildMetadata, jsonLd, SITE_NAME } from "@/lib/seo";
import Prose from "@/components/ui/Prose";

type Props = { params: Promise<{ slug: string }> };
const getPost = (slug: string) =>
  prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" }, include: { author: { select: { fullName: true } }, category: true } });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  return buildMetadata("BLOG", slug, {
    title: post.title, description: post.excerpt ?? post.content.slice(0, 160), path: `/blog/${slug}`, image: post.coverImage,
  });
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const structured = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.author.fullName },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      {post.category && <p className="text-xs font-medium uppercase tracking-wide text-gold">{post.category.name}</p>}
      <h1 className="mt-2 text-4xl font-bold leading-tight text-brand">{post.title}</h1>
      <p className="mt-3 text-sm text-slate-500">By {post.author.fullName}</p>
      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImage} alt={post.title} className="mt-6 aspect-[16/9] w-full rounded-xl object-cover" />
      )}
      <div className="mt-8"><Prose text={post.content} /></div>
    </article>
  );
}

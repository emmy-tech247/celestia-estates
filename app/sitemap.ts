import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600; // regenerate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base: MetadataRoute.Sitemap = ["", "/properties", "/locations", "/blog", "/about", "/services", "/contact", "/become-a-partner"].map((p) => ({
    url: absoluteUrl(p || "/"), lastModified: now, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7,
  }));

  try {
    const [properties, locations, posts] = await Promise.all([
      prisma.property.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.location.findMany({ where: { properties: { some: { status: "PUBLISHED" } } }, select: { slug: true } }),
      prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    ]);
    return [
      ...base,
      ...properties.map((p) => ({ url: absoluteUrl(`/properties/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "daily" as const, priority: 0.9 })),
      ...locations.map((l) => ({ url: absoluteUrl(`/locations/${l.slug}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
      ...posts.map((b) => ({ url: absoluteUrl(`/blog/${b.slug}`), lastModified: b.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ];
  } catch {
    return base; // database unreachable (e.g. at build time): still serve the static pages
  }
}

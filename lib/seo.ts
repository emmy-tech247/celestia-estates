import type { Metadata } from "next";
import type { SeoEntity } from "@prisma/client";
import prisma from "./prisma";

export const siteUrl = () => (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const absoluteUrl = (path: string) => `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
export const SITE_NAME = "Celestia Estates";

/** Merges admin-managed overrides (seo_metadata) over generated defaults. */
export async function buildMetadata(
  entityType: SeoEntity,
  entityKey: string,
  defaults: { title: string; description: string; path: string; image?: string | null }
): Promise<Metadata> {
  const o = await prisma.seoMetadata.findUnique({ where: { entityType_entityKey: { entityType, entityKey } } }).catch(() => null);
  const title = o?.title ?? defaults.title;
  const description = (o?.description ?? defaults.description).slice(0, 160);
  const image = o?.ogImage ?? defaults.image ?? undefined;
  return {
    title,
    description,
    alternates: { canonical: o?.canonicalUrl ?? absoluteUrl(defaults.path) },
    robots: o?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: { title, description, url: absoluteUrl(defaults.path), siteName: SITE_NAME, type: "website", images: image ? [image] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description },
  };
}

/** Safe JSON-LD serialisation (prevents </script> breakouts). */
export const jsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

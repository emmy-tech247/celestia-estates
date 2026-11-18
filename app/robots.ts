import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/agent", "/customer", "/partner", "/api/", "/ref/", "/login", "/register", "/forgot-password", "/reset-password"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

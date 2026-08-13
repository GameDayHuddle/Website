import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamedayhuddle.com";
  return ["", "/about", "/pricing", "/download", "/signup", "/login", "/privacy", "/terms"].map((path, index) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: index === 0 ? "weekly" : "monthly", priority: index === 0 ? 1 : path === "/pricing" || path === "/download" ? 0.9 : 0.6 }));
}

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://noor.app";
  const now = new Date();

  const staticRoutes = [
    "",
    "/quran",
    "/library",
    "/ask",
    "/adhkar",
    "/prayer-times",
    "/qibla",
    "/tasbeeh",
    "/tools",
    "/search",
    "/about",
    "/contact",
    "/privacy",
    "/settings",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const surahRoutes = Array.from({ length: 114 }, (_, i) => ({
    url: `${baseUrl}/quran/${i + 1}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...surahRoutes];
}

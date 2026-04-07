import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";
import { CREATORS_LIST } from "@/lib/creators";

const SITE_URL = "https://hitokarawedding.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/concept`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/creators`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/simulation`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/journal`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const creatorPages: MetadataRoute.Sitemap = CREATORS_LIST.map((creator) => ({
    url: `${SITE_URL}/creators/${creator.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const journalPages: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${SITE_URL}/journal/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...creatorPages, ...journalPages];
}

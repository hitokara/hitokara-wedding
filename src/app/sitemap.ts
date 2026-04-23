import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";
import { CREATORS_LIST } from "@/lib/creators";
import { getArticles, getCreators } from "@/lib/microcms";

const SITE_URL = "https://hitokarawedding.com";

// Revalidate sitemap every 10 minutes so CMS additions propagate quickly.
export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/concept`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/creators`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/simulation`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  // Fetch dynamic data from CMS with local fallback
  const [cmsCreators, cmsArticles] = await Promise.all([
    getCreators({ limit: 100 }).catch(() => ({ contents: [] })),
    getArticles({ limit: 100 }).catch(() => ({ contents: [] })),
  ]);

  const creatorEntries =
    cmsCreators.contents.length > 0
      ? cmsCreators.contents.map((c) => ({
          id: c.id,
          updatedAt: new Date(c.updatedAt ?? c.publishedAt ?? now),
        }))
      : CREATORS_LIST.map((c) => ({ id: c.id, updatedAt: now }));

  const creatorPages: MetadataRoute.Sitemap = creatorEntries.map((c) => ({
    url: `${SITE_URL}/creators/${c.id}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const articleEntries =
    cmsArticles.contents.length > 0
      ? cmsArticles.contents.map((a) => ({
          slug: a.slug ?? a.id,
          updatedAt: new Date(a.updatedAt ?? a.publishedAt ?? now),
        }))
      : ARTICLES.map((a) => ({ slug: a.slug, updatedAt: now }));

  const journalPages: MetadataRoute.Sitemap = articleEntries.map((a) => ({
    url: `${SITE_URL}/journal/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...creatorPages, ...journalPages];
}

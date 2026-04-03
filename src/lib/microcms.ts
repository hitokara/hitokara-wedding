import { createClient } from "microcms-js-sdk";

// ---------- Client ----------
export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "",
  apiKey: process.env.MICROCMS_API_KEY || "",
});

// ---------- Common Types ----------
export interface MicroCMSImage {
  url: string;
  height: number;
  width: number;
}

export interface MicroCMSContent {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
}

// ---------- Category (relation) ----------
export interface CMSCategory extends MicroCMSContent {
  name: string;
}

// ---------- Creator ----------
export interface CMSCreator extends MicroCMSContent {
  name: string;
  role?: string;
  category?: CMSCategory;       // リレーション（単一）
  price?: number;
  tags?: string[];
  profile?: string;
  images?: MicroCMSImage[];
  works?: MicroCMSImage[];
}

// ---------- Journal Article ----------
export interface CMSArticle extends MicroCMSContent {
  title: string;
  slug?: string;
  category?: CMSCategory;       // リレーション（単一）
  body: string;                 // リッチエディタ HTML
  excerpt?: string;
  thumbnail?: MicroCMSImage;
  author?: string;
  date?: string;
}

// ---------- Venue ----------
export interface CMSVenue extends MicroCMSContent {
  name: string;
  area?: string;
  image?: MicroCMSImage;
  capacity?: string;
  description?: string;
}

// ---------- News ----------
export interface CMSNews extends MicroCMSContent {
  title: string;
  body: string;
  date?: string;
}

// ---------- API Response ----------
type ListResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

// ---------- Safe fetch wrapper ----------
// microCMS がまだデータ0件 or API未設定でもクラッシュしない
async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn("[microCMS]", e instanceof Error ? e.message : e);
    return fallback;
  }
}

const EMPTY_LIST = { contents: [], totalCount: 0, offset: 0, limit: 0 };

// ---------- Creators ----------
export async function getCreators(params?: {
  limit?: number;
  offset?: number;
  filters?: string;
}) {
  return safeFetch(
    () =>
      client.get<ListResponse<CMSCreator>>({
        endpoint: "creators",
        queries: {
          limit: params?.limit ?? 100,
          offset: params?.offset ?? 0,
          filters: params?.filters,
          orders: "-publishedAt",
        },
      }),
    EMPTY_LIST as ListResponse<CMSCreator>
  );
}

export async function getCreatorById(id: string) {
  return safeFetch(
    () => client.get<CMSCreator>({ endpoint: "creators", contentId: id }),
    null as CMSCreator | null
  );
}

// ---------- Articles ----------
export async function getArticles(params?: {
  limit?: number;
  offset?: number;
  filters?: string;
}) {
  return safeFetch(
    () =>
      client.get<ListResponse<CMSArticle>>({
        endpoint: "articles",
        queries: {
          limit: params?.limit ?? 20,
          offset: params?.offset ?? 0,
          filters: params?.filters,
          orders: "-publishedAt",
        },
      }),
    EMPTY_LIST as ListResponse<CMSArticle>
  );
}

export async function getArticleBySlug(slug: string) {
  const res = await safeFetch(
    () =>
      client.get<ListResponse<CMSArticle>>({
        endpoint: "articles",
        queries: { filters: `slug[equals]${slug}`, limit: 1 },
      }),
    EMPTY_LIST as ListResponse<CMSArticle>
  );
  return res.contents[0] ?? null;
}

export async function getArticleById(id: string) {
  return safeFetch(
    () => client.get<CMSArticle>({ endpoint: "articles", contentId: id }),
    null as CMSArticle | null
  );
}

// ---------- Venues ----------
export async function getVenues(params?: { limit?: number }) {
  return safeFetch(
    () =>
      client.get<ListResponse<CMSVenue>>({
        endpoint: "venues",
        queries: { limit: params?.limit ?? 50 },
      }),
    EMPTY_LIST as ListResponse<CMSVenue>
  );
}

// ---------- News ----------
export async function getNews(params?: { limit?: number }) {
  return safeFetch(
    () =>
      client.get<ListResponse<CMSNews>>({
        endpoint: "news",
        queries: { limit: params?.limit ?? 10, orders: "-publishedAt" },
      }),
    EMPTY_LIST as ListResponse<CMSNews>
  );
}

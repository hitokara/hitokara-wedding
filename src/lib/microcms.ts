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
  category?: string[];           // セレクトフィールド（配列）
  categoryLabel?: string;
  price?: number;
  tags?: string[];               // セレクトフィールド（配列）
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

// ---------- Mapping helpers ----------
import type { Creator } from "@/lib/creators";
import type { Article } from "@/lib/articles";

const CATEGORY_MAP: Record<string, { cat: string; catLabel: string }> = {
  "プランナー": { cat: "planner", catLabel: "プランナー" },
  "カメラマン": { cat: "photo", catLabel: "カメラマン" },
  "映像": { cat: "movie", catLabel: "映像" },
  "ヘアメイク": { cat: "hair", catLabel: "ヘアメイク" },
  "司会": { cat: "mc", catLabel: "司会" },
  "フラワー": { cat: "flower", catLabel: "フラワー" },
  "ドレス": { cat: "dress", catLabel: "ドレス" },
};

const ARTICLE_GRADIENTS = [
  "linear-gradient(155deg,#7aa8c0,#3a6888)",
  "linear-gradient(155deg,#9ac8d8,#5898b8)",
  "linear-gradient(155deg,#6898b8,#385878)",
  "linear-gradient(155deg,#8ab8d0,#4a7898)",
];

/** CMS Creator -> local Creator shape */
export function mapCMSCreator(c: CMSCreator): Creator {
  const catName = c.categoryLabel ?? c.category?.[0] ?? "";
  const mapped = CATEGORY_MAP[catName] ?? { cat: catName, catLabel: catName };
  return {
    id: c.id,
    name: c.name,
    role: c.role ?? "",
    cat: mapped.cat,
    catLabel: mapped.catLabel || c.categoryLabel || "",
    price: c.price ?? 0,
    tags: c.tags ?? [],
    profile: c.profile ?? "",
    fav: false,
  };
}

/** Format ISO date to YYYY.MM.DD */
function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** CMS Article -> local Article shape */
export function mapCMSArticle(a: CMSArticle, index: number): Article {
  return {
    slug: a.slug || a.id,
    cat: a.category?.name ?? "ノウハウ",
    title: a.title,
    date: formatDate(a.date || a.publishedAt),
    author: a.author ?? "",
    excerpt: a.excerpt,
    gradient: ARTICLE_GRADIENTS[index % ARTICLE_GRADIENTS.length],
  };
}

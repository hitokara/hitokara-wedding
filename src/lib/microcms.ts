import { createClient } from "microcms-js-sdk";

// ---------- Client ----------
const domain = process.env.MICROCMS_SERVICE_DOMAIN;
const key = process.env.MICROCMS_API_KEY;

function buildClient() {
  if (!domain || !key) return null;
  return createClient({ serviceDomain: domain, apiKey: key });
}

export const client = buildClient();

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
  mbti?: string;
  likes?: string;
  weddingThought?: string;
  snsInstagram?: string;
  sampleVideoUrl?: string;       // YouTube / Vimeo URL
  sampleVideoTitle?: string;     // 動画タイトル（任意）
  images?: MicroCMSImage;        // 単一画像フィールド
  works?: MicroCMSImage[];       // 複数画像フィールド
  menus?: CMSCreatorMenu[];      // メニュー（繰り返しフィールド）
}

// Creator menu item (repeating field)
export interface CMSCreatorMenu {
  fieldId: string;               // "menus"
  name: string;
  price: number;
  includes?: string;             // 含まれるもの
  note?: string;
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
  price?: number;
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
// microCMS が未設定 or データ0件でもクラッシュしない
async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!client) return fallback;
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
      client!.get<ListResponse<CMSCreator>>({
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
    () => client!.get<CMSCreator>({ endpoint: "creators", contentId: id }),
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
      client!.get<ListResponse<CMSArticle>>({
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
      client!.get<ListResponse<CMSArticle>>({
        endpoint: "articles",
        queries: { filters: `slug[equals]${slug}`, limit: 1 },
      }),
    EMPTY_LIST as ListResponse<CMSArticle>
  );
  return res.contents[0] ?? null;
}

export async function getArticleById(id: string) {
  return safeFetch(
    () => client!.get<CMSArticle>({ endpoint: "articles", contentId: id }),
    null as CMSArticle | null
  );
}

// ---------- Venues ----------
export async function getVenues(params?: { limit?: number }) {
  return safeFetch(
    () =>
      client!.get<ListResponse<CMSVenue>>({
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
      client!.get<ListResponse<CMSNews>>({
        endpoint: "news",
        queries: { limit: params?.limit ?? 10, orders: "-publishedAt" },
      }),
    EMPTY_LIST as ListResponse<CMSNews>
  );
}

// ---------- Sim Items ----------
export interface CMSSimOption {
  fieldId: string;
  name: string;
  desc?: string;
  price?: number;
  unitPrice?: number;
  tag?: string[];
  creatorCategory?: string;
}

export interface CMSSimItem extends MicroCMSContent {
  key: string;
  label: string;
  sortOrder?: number;
  note?: string;
  special?: string[];
  options?: CMSSimOption[];
}

export async function getSimItems() {
  return safeFetch(
    () =>
      client!.get<ListResponse<CMSSimItem>>({
        endpoint: "sim-items",
        queries: { limit: 20, orders: "sortOrder" },
      }),
    EMPTY_LIST as ListResponse<CMSSimItem>
  );
}

// ---------- Mapping helpers ----------
import type { Creator } from "@/lib/creators";
import type { Article } from "@/lib/articles";
import type { CategoryItem, CategoryGroup } from "@/lib/simulation";

const CATEGORY_MAP: Record<string, { cat: string; catLabel: string }> = {
  // プランナー
  "プランナー": { cat: "planner", catLabel: "プランナー" },
  // 写真
  "写真": { cat: "photo", catLabel: "写真" },
  "カメラマン": { cat: "photo", catLabel: "写真" },
  "フォトグラファー": { cat: "photo", catLabel: "写真" },
  // 映像
  "映像": { cat: "movie", catLabel: "映像" },
  "ビデオ": { cat: "movie", catLabel: "映像" },
  "ビデオグラファー": { cat: "movie", catLabel: "映像" },
  // 写真・映像（旧統合カテゴリ → 写真を既定に）
  "写真・映像": { cat: "photo", catLabel: "写真" },
  // ヘアメイク
  "ヘアメイク": { cat: "hair", catLabel: "ヘアメイク" },
  // パーティー（司会・音響・キャプテンを統合）
  "パーティー": { cat: "party", catLabel: "パーティー" },
  "音楽": { cat: "party", catLabel: "パーティー" },
  "司会": { cat: "party", catLabel: "パーティー" },
  "音響": { cat: "party", catLabel: "パーティー" },
  "キャプテン": { cat: "party", catLabel: "パーティー" },
  // 装花
  "装花": { cat: "flower", catLabel: "装花" },
  "フラワー": { cat: "flower", catLabel: "装花" },
  // ドレス・スタイリスト
  "ドレス": { cat: "dress", catLabel: "ドレス" },
  "スタイリスト": { cat: "dress", catLabel: "ドレス" },
  // アイテム（デザイナー・ギフト等）
  "アイテム": { cat: "item", catLabel: "アイテム" },
  "デザイナー": { cat: "item", catLabel: "アイテム" },
  "ギフト": { cat: "item", catLabel: "アイテム" },
  // Other
  "その他": { cat: "other", catLabel: "Other" },
  "other": { cat: "other", catLabel: "Other" },
  "Other": { cat: "other", catLabel: "Other" },
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
    mbti: c.mbti,
    likes: c.likes,
    weddingThought: c.weddingThought,
    snsInstagram: c.snsInstagram,
    sampleVideoUrl: c.sampleVideoUrl,
    sampleVideoTitle: c.sampleVideoTitle,
    images: c.images ? [{ url: c.images.url }] : undefined,
    works: Array.isArray(c.works) ? c.works.map((img) => ({ url: img.url })) : undefined,
    menus: Array.isArray(c.menus)
      ? c.menus.map((m, i) => ({
          id: `${c.id}-m${i}`,
          name: m.name,
          price: m.price ?? 0,
          includes: m.includes,
          note: m.note,
        }))
      : undefined,
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
    thumbnailUrl: a.thumbnail?.url,
  };
}

/** CMS SimItem option -> local CategoryItem */
function mapSimOption(simKey: string, opt: CMSSimOption, idx: number): CategoryItem {
  const item: CategoryItem = {
    id: `${simKey}-${idx}`,
    label: opt.name,
    price: opt.unitPrice ?? opt.price ?? 0,
  };
  if (opt.desc) item.note = opt.desc;
  if (opt.unitPrice) item.unit = "人";

  // tag mapping: ["nom"] -> nom:1, ["bring"] -> bring flag (keep as-is for now)
  const tag = opt.tag?.[0];
  if (tag === "nom") {
    item.nom = 1;
    item.price = 0;
    if (opt.creatorCategory) item.ck = opt.creatorCategory;
  }

  return item;
}

/** CMS SimItems -> local CategoryGroup[] (accordion-ready) */
export function mapCMSSimItems(items: CMSSimItem[]): CategoryGroup[] {
  return items.map((sim) => ({
    id: sim.key,
    title: sim.label,
    note: sim.note,
    special: sim.special?.[0],
    items: (sim.options ?? []).map((opt, i) => mapSimOption(sim.key, opt, i)),
  }));
}

/** Extended CategoryGroup carrying CMS metadata for the simulation page */
export interface CMSCategoryGroup extends CategoryGroup {
  note?: string;
  special?: string;
}

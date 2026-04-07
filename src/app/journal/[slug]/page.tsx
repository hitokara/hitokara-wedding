import type { Metadata } from "next";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import Breadcrumb from "@/components/Breadcrumb";
import { ARTICLES, getArticleBySlug as getLocalArticle } from "@/lib/articles";
import {
  getArticleBySlug as getCMSArticleBySlug,
  getArticleById as getCMSArticleById,
  getArticles,
  mapCMSArticle,
  type CMSArticle,
} from "@/lib/microcms";
import s from "./page.module.css";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

/** Try CMS first (by slug, then by id), then fall back to local */
async function resolveArticle(slug: string) {
  // 1. Try microCMS slug search
  const bySlug = await getCMSArticleBySlug(slug);
  if (bySlug) return { cms: bySlug, local: null };

  // 2. Try microCMS content-id lookup
  const byId = await getCMSArticleById(slug);
  if (byId) return { cms: byId, local: null };

  // 3. Fall back to local
  const local = getLocalArticle(slug) ?? null;
  return { cms: null, local };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { cms, local } = await resolveArticle(slug);

  const title = cms?.title ?? local?.title ?? slug;
  const excerpt = cms?.excerpt ?? local?.excerpt;
  const description = excerpt
    ? `${excerpt} | 横浜・鎌倉のウェディングプロデュース ヒトカラウェディングのジャーナル。`
    : `${title} - 横浜・鎌倉の結婚式に関する記事。ヒトカラウェディングジャーナル。`;
  const thumbnailUrl = cms?.thumbnail?.url;
  return {
    title,
    description,
    alternates: {
      canonical: `https://hitokara-wedding.com/journal/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://hitokara-wedding.com/journal/${slug}`,
      ...(thumbnailUrl
        ? {
            images: [
              {
                url: thumbnailUrl,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;
  const { cms, local } = await resolveArticle(slug);

  // Map CMS data or use local
  const article = cms ? mapCMSArticle(cms, 0) : local;

  const title = article?.title ?? "記事タイトル";
  const cat = article?.cat ?? "ノウハウ";
  const date = article?.date ?? "2025.06.01";
  const author = article?.author ?? "大久保 雄治";
  const gradient = article?.gradient ?? "linear-gradient(155deg,#8ab8d0,#4a7898)";
  const thumbnailUrl = article?.thumbnailUrl ?? (cms?.thumbnail?.url || null);
  const excerptText = article?.excerpt ??
    "鎌倉の神社・寺院で行う神前式は、凛とした空気の中で誓いを立てる特別な体験。古都の歴史と自然が織りなす空間で、和装のふたりが映えます。";

  // CMS rich-text body (HTML) - only available from CMS
  const bodyHtml = cms?.body ?? null;

  // Related articles: fetch from CMS or fall back to local
  const cmsAll = await getArticles({ limit: 10 });
  const relatedArticles =
    cmsAll.contents.length > 0
      ? cmsAll.contents
          .filter((a) => (a.slug || a.id) !== slug)
          .slice(0, 3)
          .map((a, i) => mapCMSArticle(a, i))
      : ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  // All articles for sidebar
  const allArticles =
    cmsAll.contents.length > 0
      ? cmsAll.contents.map((a, i) => mapCMSArticle(a, i))
      : ARTICLES;
  const recentArticles = allArticles.filter((a) => a.slug !== slug).slice(0, 5);

  const SIDE_CATS = [
    { name: "エリア情報", count: 8 },
    { name: "クリエイター紹介", count: 12 },
    { name: "ノウハウ", count: 7 },
    { name: "費用・見積もり", count: 5 },
    { name: "実例レポート", count: 4 },
    { name: "和婚", count: 6 },
  ];

  const heroStyle = thumbnailUrl
    ? { backgroundImage: `url(${thumbnailUrl})` }
    : { background: gradient };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerptText,
    datePublished: date.replace(/\./g, "-"),
    author: { "@type": "Person" as const, name: author },
    publisher: {
      "@type": "Organization" as const,
      name: "ヒトカラウェディング",
      url: "https://hitokara-wedding.com",
    },
    ...(thumbnailUrl ? { image: thumbnailUrl } : {}),
    mainEntityOfPage: {
      "@type": "WebPage" as const,
      "@id": `https://hitokara-wedding.com/journal/${slug}`,
    },
  };

  return (
    <div className={s.layoutWrap}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className={s.jMain}>
        <Breadcrumb items={[{ label: "Journal", href: "/journal" }, { label: title }]} />

        {/* Article Header: photo + text overlay */}
        <div className={s.abHeader} style={heroStyle}>
          <div className={s.abHeaderOverlay}>
            <span className={s.abCat}>{cat}</span>
            <h1 className={s.abTitle}>{title}</h1>
            <div className={s.abMetaRow}>
              <div className={s.abAuthorAv}>{author[0]}</div>
              <span>{author}</span>
              <div className={s.abSep} />
              <span>{date}</span>
              <div className={s.abSep} />
              <span>読了5分</span>
            </div>
          </div>
        </div>

        <article className={s.article}>
          {bodyHtml ? (
            /* CMS rich-text body */
            <AnimateOnScroll animation="fadeUp">
              <div
                className={s.abRichBody}
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </AnimateOnScroll>
          ) : (
            /* Fallback static content */
            <>
              <AnimateOnScroll animation="fadeUp">
                <p className={s.abLead}>{excerptText}</p>
              </AnimateOnScroll>

              <h2 className={s.abH2}>はじめに</h2>
              <p className={s.abP}>
                横浜から電車で40分ほどのアクセスの良さに加え、鎌倉には国指定の重要文化財を持つ神社・寺院が多く、格調ある神前式が叶います。鶴岡八幡宮を筆頭に、各エリアにゆかりの深い場所があります。
              </p>

              <div className={s.abCallout}>
                <div className={s.abCalloutBody}>
                  「鎌倉は街全体が式場になる感覚。挙式後の写真散歩が楽しみで選びました」
                </div>
              </div>

              <p className={s.abP}>
                持込カメラマンを活用すれば、神社の境内はもちろん、由比ヶ浜の海岸や古民家街を巡りながらのフォトセッションも可能です。
              </p>

              <h2 className={s.abH2}>エリア別おすすめ神社・会場</h2>
              <p className={s.abP}>
                北鎌倉エリア・鎌倉中心部・逗子・葉山と、それぞれの雰囲気が異なります。プランナーと一緒に事前に下見することをおすすめします。
              </p>
            </>
          )}

          <div className={s.abTagsRow}>
            <span className={s.abTag}>鎌倉</span>
            <span className={s.abTag}>和婚</span>
            <span className={s.abTag}>神前式</span>
            <span className={s.abTag}>{cat}</span>
          </div>
        </article>
      </div>

      {/* Sidebar: same structure as journal list page */}
      <aside className={s.artSide}>
        {/* Categories */}
        <div className={s.sideSection}>
          <span className={s.sideLbl}>Categories</span>
          <div className={s.sideCats}>
            {SIDE_CATS.map((c) => (
              <Link href={`/journal`} key={c.name} className={s.sideCatItem}>
                {c.name}
                <span className={s.sideCatCount}>{c.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent articles */}
        <div className={s.sideSection}>
          <span className={s.sideLbl}>新着記事</span>
          <div className={s.sideRecent}>
            {recentArticles.map((a) => (
              <Link href={`/journal/${a.slug}`} key={a.slug} className={s.srCard}>
                {a.thumbnailUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={a.thumbnailUrl} alt={a.title} className={s.srImg} />
                ) : (
                  <div className={s.srImg} style={{ background: a.gradient }} />
                )}
                <div>
                  <div className={s.srCat}>{a.cat}</div>
                  <div className={s.srTitle}>{a.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Simulation CTA */}
        <div className={s.sideCta}>
          <div className={s.sideCtaLbl}>Simulation</div>
          <div className={s.sideCtaH}>まず、概算を確認してみる</div>
          <Link href="/simulation" className={s.sideCtaBtn}>シミュレーターを試す</Link>
        </div>

        {/* LINE CTA */}
        <div className={s.sideCta}>
          <div className={s.sideCtaLbl}>Consultation</div>
          <div className={s.sideCtaH}>プランナーに相談する</div>
          <a href="https://lin.ee/tRn0iPk" target="_blank" rel="noopener noreferrer" className={s.sideCtaBtn}>
            <span className={s.pip} />LINEで無料相談
          </a>
        </div>
      </aside>
    </div>
  );
}

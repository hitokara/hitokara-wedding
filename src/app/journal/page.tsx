import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { ARTICLES } from "@/lib/articles";
import { getArticles, mapCMSArticle } from "@/lib/microcms";
import s from "./page.module.css";

import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ジャーナル - 結婚式準備のヒントと横浜・鎌倉の会場情報",
  description:
    "横浜・鎌倉エリアの結婚式に関するジャーナル。会場レポート、クリエイター紹介、費用・見積もりのノウハウ、持ち込み自由のウェディングスタイルなど、ふたりらしい結婚式づくりのヒントをお届けします。",
  alternates: {
    canonical: "https://hitokara-wedding.com/journal",
  },
};

const SIDE_CATS = [
  { name: "エリア情報", count: 8 },
  { name: "クリエイター紹介", count: 12 },
  { name: "ノウハウ", count: 7 },
  { name: "費用・見積もり", count: 5 },
  { name: "実例レポート", count: 4 },
  { name: "和婚", count: 6 },
];

export default async function JournalPage() {
  const cmsResult = await getArticles({ limit: 20 });
  const articles =
    cmsResult.contents.length > 0
      ? cmsResult.contents.map((a, i) => mapCMSArticle(a, i))
      : ARTICLES;

  const featured = articles.slice(0, 2);
  const grid = articles.slice(2);
  const recent = articles.slice(0, 4);

  return (
    <div className={s.layoutWrap}>
      <div className={s.jMain}>
        <div className={s.pageHdr}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.pageEye}>Journal</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h1 className={s.pageH1}>横浜・鎌倉の結婚式<em>ジャーナル</em></h1>
          </AnimateOnScroll>
        </div>

        <div className={s.gridSection}>
          {/* Featured */}
          <div className={s.featRow}>
            {featured.map((a, i) => (
              <AnimateOnScroll key={a.slug} animation="fadeUp" delay={80 + i * 80}>
                <Link href={`/journal/${a.slug}`} className={s.featCard}>
                  <div className={s.featImg} style={{ background: a.gradient }} />
                  <div className={s.featCat}>{a.cat}</div>
                  <div className={s.featTitle}>{a.title}</div>
                  {a.excerpt && <div className={s.featExcerpt}>{a.excerpt}</div>}
                  <div className={s.featMeta}>
                    <div className={s.featAuthorAv}>{a.author[0]}</div>
                    <div>{a.author}</div>
                    <div className={s.featSep} />
                    <div>{a.date}</div>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Article Grid */}
          <div className={s.artGrid}>
            {grid.map((a) => (
              <Link href={`/journal/${a.slug}`} key={a.slug} className={s.artCard}>
                <div className={s.artImg}>
                  <div className={s.artImgInner} style={{ background: a.gradient }} />
                </div>
                <div className={s.artCat}>{a.cat}</div>
                <div className={s.artTitle}>{a.title}</div>
                <div className={s.artMeta}>
                  <span>{a.author}</span>
                  <span className={s.artSep} />
                  <span>{a.date}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={s.sidebar}>
        <div className={s.sideSection}>
          <div className={s.sideLbl}>Categories</div>
          <div className={s.sideCats}>
            {SIDE_CATS.map((c) => (
              <div key={c.name} className={s.sideCat}>
                {c.name}
                <span className={s.sideCatCount}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={s.sideSection}>
          <div className={s.sideLbl}>新着記事</div>
          <div className={s.sideRecent}>
            {recent.map((a) => (
              <Link href={`/journal/${a.slug}`} key={a.slug} className={s.sideArt}>
                <div className={s.sideArtImg} style={{ background: a.gradient }} />
                <div>
                  <div className={s.sideArtCat}>{a.cat}</div>
                  <div className={s.sideArtTitle}>{a.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className={s.sideCta}>
          <div className={s.sideCtaLbl}>Simulation</div>
          <div className={s.sideCtaH}>まず、概算を確認してみる</div>
          <Link href="/simulation" className={s.sideCtaBtn}>シミュレーターを試す</Link>
        </div>
      </aside>
    </div>
  );
}

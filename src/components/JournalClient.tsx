"use client";

import { useState } from "react";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";

interface Article {
  slug: string;
  title: string;
  cat: string;
  date: string;
  author: string;
  excerpt?: string;
  gradient: string;
}

interface SideCat {
  name: string;
  count: number;
}

interface JournalClientProps {
  articles: Article[];
  sideCats: SideCat[];
  styles: Record<string, string>;
}

export default function JournalClient({ articles, sideCats, styles: s }: JournalClientProps) {
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const filtered = activeCat
    ? articles.filter((a) => a.cat === activeCat)
    : articles;

  const featured = filtered.slice(0, 2);
  const grid = filtered.slice(2);
  const recent = articles.slice(0, 4);

  return (
    <div className={s.layoutWrap}>
      <div className={s.jMain}>
        <div className={s.pageHdr}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.pageEye}>Journal</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h1 className={s.pageH1}>結婚式<em>ジャーナル</em></h1>
          </AnimateOnScroll>
        </div>

        {/* Filter bar */}
        <div className={s.filterBar}>
          <button
            className={`${s.fBtn} ${!activeCat ? s.fBtnOn : ""}`}
            onClick={() => setActiveCat(null)}
          >
            すべて
          </button>
          {sideCats.map((c) => (
            <button
              key={c.name}
              className={`${s.fBtn} ${activeCat === c.name ? s.fBtnOn : ""}`}
              onClick={() => setActiveCat(c.name)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className={s.gridSection}>
          {filtered.length === 0 ? (
            <p style={{ color: "var(--t2)", fontSize: 14, padding: "20px 0" }}>該当する記事がありません。</p>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className={s.sidebar}>
        <div className={s.sideSection}>
          <div className={s.sideLbl}>Categories</div>
          <div className={s.sideCats}>
            {sideCats.map((c) => (
              <div
                key={c.name}
                className={s.sideCat}
                onClick={() => setActiveCat(activeCat === c.name ? null : c.name)}
                style={{ cursor: "pointer" }}
              >
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

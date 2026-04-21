import type { Metadata } from "next";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import CreatorTrack from "@/components/CreatorTrack";
import VenueGrid from "@/components/VenueGrid";
import { CREATORS_LIST } from "@/lib/creators";
import { ARTICLES } from "@/lib/articles";
import { getCreators, getArticles, getVenues, mapCMSCreator, mapCMSArticle } from "@/lib/microcms";
import s from "./page.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "横浜・鎌倉で、ふたりらしい結婚式を | ヒトカラウェディング",
  description:
    "横浜・鎌倉エリアで、クリエイターを自分で選べるウェディングプロデュース。持ち込み自由・適正価格の結婚式。カメラマン・プランナー・ヘアメイクを顔と実績で指名。鶴岡八幡宮・鎌倉宮での神前式にも対応。見積もりシミュレーターで費用をリアルタイム試算。",
  alternates: {
    canonical: "https://hitokarawedding.com",
  },
};

const VALUES = [
  {
    num: "Value 01",
    title: "人で選ぶ",
    lead: "「当日初めまして」のない、安心の結婚式を。",
    desc: "プロフィールや料金を比較し、事前に面談してからクリエイターを決定できます。想いに共感できるパートナーを自分たちで選べるからこそ、準備期間から当日まで、最高のチームで過ごせます。",
  },
  {
    num: "Value 02",
    title: "適正価格",
    lead: "「最終的にいくらになるかわからない」という不安を解消するため、シミュレーターで精度の高い概算を算出。",
    desc: "無駄なオプションを省いて必要なものだけを選べる透明性の高いプランニングで、初期見積もりからの大幅なランクアップを防ぎ、予算内での理想の結婚式を叶えます。",
  },
  {
    num: "Value 03",
    title: "持込自由",
    lead: "持ち込み料や不透明な追加費用はかかりません。",
    desc: "予算を抑えられる部分はプロの視点で一緒に考え、こだわりたいポイントに賢く予算を充てる。そんな「理想のバランス」を形にします。",
  },
  {
    num: "Value 04",
    title: "好きな場所で",
    lead: "決まった会場はありません。おふたりの思い出の場所や、普段は結婚式を行わない場所でも、フリープランナーが理想の空間に仕立て上げます。",
    desc: "もちろん、おもてなしに最適な厳選レストランのご紹介も可能。しきたりに縛られない、世界にひとつだけの舞台選びからスタートしましょう。",
  },
];

const HERO_SLIDES = [
  "url(/hero-1.jpg) center/cover no-repeat",
  "url(/hero-2.jpg) center/cover no-repeat",
  "url(/hero-3.jpg) center/cover no-repeat",
];

const STEPS = [
  { n: 1, done: true, t: "クリエイターを探す", d: "カテゴリ・スタイルで絞り込み、気になるクリエイターをお気に入りに。" },
  { n: 2, done: true, t: "シミュレーターで概算確認", d: "人数・プランを選ぶだけでリアルタイムに合計が出ます。" },
  { n: 3, done: true, t: "LINEで無料相談", d: "気になることを気軽に。担当プランナーが丁寧に回答します。" },
  { n: 4, done: false, t: "チームを組んで準備スタート", d: "指名したクリエイターとふたりで一緒に作る、世界に一つの式。" },
];

const VENUES_FALLBACK = [
  { name: "横浜ベイサイド", area: "YOKOHAMA", bg: "linear-gradient(155deg,#8ab8d0,#4a7898)", desc: "海を望むベイエリアのリゾート空間。着席30〜120名" },
  { name: "鎌倉 古民家", area: "KAMAKURA", bg: "linear-gradient(155deg,#9ac8d8,#5898b8)", desc: "鎌倉の歴史ある古民家を貸切。着席20〜60名" },
  { name: "逗子マリーナ", area: "ZUSHI", bg: "linear-gradient(155deg,#7aa8c0,#3a6888)", desc: "南仏風リゾートで海辺のウェディング。着席30〜80名" },
  { name: "葉山 山荘", area: "HAYAMA", bg: "linear-gradient(155deg,#6898b8,#385878)", desc: "緑豊かな山荘で落ち着いた式を。着席20〜50名" },
];

const GRADIENTS = [
  "linear-gradient(155deg,#8ab8d0,#4a7898)",
  "linear-gradient(155deg,#9ac8d8,#5898b8)",
  "linear-gradient(155deg,#7aa8c0,#3a6888)",
  "linear-gradient(155deg,#6898b8,#385878)",
  "linear-gradient(155deg,#8ab8d0,#4a7898)",
  "linear-gradient(155deg,#9ac8d8,#5898b8)",
  "linear-gradient(155deg,#7aa8c0,#3a6888)",
  "linear-gradient(155deg,#6898b8,#385878)",
];

function WaveSvg() {
  return (
    <svg viewBox="0 0 2400 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M0 12c200-12 400 12 600 0s400-12 600 0 400 12 600 0 400-12 600 0v12H0z" fill="var(--sand)" />
    </svg>
  );
}

export default async function HomePage() {
  // Fetch from microCMS with local fallback
  const [cmsCreators, cmsArticles, cmsNews, cmsVenues] = await Promise.all([
    getCreators({ limit: 8 }),
    getArticles({ limit: 3, filters: "category[not_equals]66uw6z5fbn" }),
    getArticles({ limit: 3, filters: "category[equals]66uw6z5fbn" }),
    getVenues({ limit: 6 }),
  ]);

  const creators =
    cmsCreators.contents.length > 0
      ? cmsCreators.contents.map(mapCMSCreator)
      : CREATORS_LIST;

  const topArticles =
    cmsArticles.contents.length > 0
      ? cmsArticles.contents.map((a, i) => mapCMSArticle(a, i))
      : ARTICLES.slice(0, 3);

  const newsArticles = cmsNews.contents.map((a, i) => mapCMSArticle(a, i));

  const venues =
    cmsVenues.contents.length > 0
      ? cmsVenues.contents.map((v, i) => ({
          name: v.name,
          area: v.area?.toUpperCase() ?? "",
          bg: v.image?.url
            ? `url(${v.image.url}?w=600&h=400&fit=crop) center/cover no-repeat`
            : GRADIENTS[i % GRADIENTS.length],
          desc: [v.description?.replace(/。+$/, ""), v.capacity ? `収容${v.capacity}` : ""].filter(Boolean).join("。"),
        }))
      : VENUES_FALLBACK;

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "ヒトカラウェディングで結婚式を準備する方法",
    description:
      "横浜・鎌倉エリアでクリエイターを自分で選んで結婚式を準備する4つのステップ",
    step: STEPS.map((st, i) => ({
      "@type": "HowToStep" as const,
      position: i + 1,
      name: st.t,
      text: st.d,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      {/* Hero (slideshow) */}
      <section className={s.hero} aria-label="ヒトカラウェディング - 横浜・鎌倉のウェディングプロデュース">
        <div className={s.heroImgArea}>
          {HERO_SLIDES.map((bg, i) => (
            <div
              key={i}
              className={s.heroSlide}
              style={{ background: bg, animationDelay: `${i * 5}s` }}
            />
          ))}
          <div className={s.heroOverlay} />
        </div>
        <div className={s.heroWave}><WaveSvg /></div>
        <div className={s.heroLeft}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.heroEye}>Yokohama &amp; Kamakura</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h1 className={s.heroH1}>
              <span style={{display:'inline-block', whiteSpace:'nowrap'}}>結婚する相手は、大好きな人。</span><br />
              <span style={{display:'inline-block', whiteSpace:'nowrap'}}>招くのも、大好きな人たち。</span><br />
              <span style={{display:'inline-block', whiteSpace:'nowrap'}}>だからこそ、</span><br />
              <span style={{display:'inline-block', whiteSpace:'nowrap'}}>結婚式も<em>&ldquo;人&rdquo;で選びたい</em></span>
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={160}>
            <p className={s.heroSub}>
              ウェディングプランナー・カメラマン・ヘアメイク&hellip;<br />
              すべてのクリエイターを顔と実績で選べる。<br />
              持ち込み自由・適正価格のウェディングプロデュース。
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={240}>
            <div className={s.heroBtns}>
              <a href="https://lin.ee/tRn0iPk" target="_blank" rel="noopener noreferrer" className={s.btnMain}>
                <span className={s.pip} />LINEで無料相談
              </a>
              <Link href="/creators" className={s.btnSub}>クリエイターを見る</Link>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={320}>
            <Link href="/simulation" className={s.heroSimLink}>
              見積もりシミュレーターを試す &rarr;
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Values */}
      <section className={s.valSec} aria-label="ヒトカラウェディングの特徴">
        <div className={s.inner}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.secEye}>Our Values</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h2 className={s.secH2}>選ぶ<em>自由</em>と、正直な価格。</h2>
          </AnimateOnScroll>
          <div className={s.valGrid}>
            {VALUES.map((v, i) => (
              <AnimateOnScroll key={v.num} animation="fadeUp" delay={160 + i * 80}>
                <div className={s.valCard}>
                  <div className={s.valNumRow}>
                    <div className={s.valNum}>{v.num}</div>
                    <div className={s.valTitle}>{v.title}</div>
                  </div>
                  <p className={s.valLead}>{v.lead}</p>
                  <p className={s.valDesc}>{v.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
          <AnimateOnScroll animation="fadeUp" delay={500}>
            <div className={s.valCta}>
              <Link href="/concept" className={s.valCtaLink}>
                ヒトカラウェディングのこだわり &rarr;
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Wave Divider */}
      <div className={s.waveDivider}>
        <svg viewBox="0 0 2400 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 12c200-12 400 12 600 0s400-12 600 0 400 12 600 0 400-12 600 0v12H0z" fill="var(--sand)" />
        </svg>
      </div>

      {/* Creator Track */}
      <section className={s.crSec} aria-label="クリエイター紹介">
        <div className={s.crHdr}>
          <div>
            <AnimateOnScroll animation="slideRight">
              <span className={s.secEye}>Meet our creators</span>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeUp" delay={80}>
              <h2 className={s.secH2}>クリエイター<em>紹介</em></h2>
            </AnimateOnScroll>
          </div>
          <Link href="/creators" className={s.seeAll}>すべて見る &rarr;</Link>
        </div>
        <CreatorTrack creators={creators} gradients={GRADIENTS} styles={s} />
      </section>

      {/* How It Works */}
      <section className={s.howSec} aria-label="ご利用の流れ">
        <div className={s.inner}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.secEye}>How it works</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h2 className={s.secH2}>たった<em>4ステップ</em>で。</h2>
          </AnimateOnScroll>
          <div className={s.steps}>
            {STEPS.map((st, i) => (
              <AnimateOnScroll key={st.n} animation="fadeUp" delay={80 + i * 80}>
                <div className={s.step}>
                  <div className={`${s.sDot} ${st.done ? s.sDotDone : s.sDotPending}`}>{st.n}</div>
                  <div>
                    <div className={s.sTitle}>{st.t}</div>
                    <p className={s.sDesc}>{st.d}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Venues */}
      <section className={s.venuesSec} id="venues" aria-label="横浜・鎌倉の結婚式会場">
        <div className={s.inner}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.secEye}>Venues</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h2 className={s.secH2}>選べる<em>会場</em>。</h2>
          </AnimateOnScroll>
          <VenueGrid venues={venues} styles={s} />
        </div>
      </section>

      {/* Journal */}
      <section className={s.jSec} aria-label="ジャーナル - 結婚式のヒント">
        <div className={s.inner}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.secEye}>Journal</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h2 className={s.secH2}>結婚式の<em>ヒント</em>と物語。</h2>
          </AnimateOnScroll>
          <div className={s.jGrid}>
            {topArticles.map((a, i) => (
              <AnimateOnScroll key={a.slug} animation="fadeUp" delay={80 + i * 80}>
                <Link href={`/journal/${a.slug}`} className={s.jCard}>
                  <div className={s.jImg}>
                    <div
                      className={s.jImgInner}
                      style={{
                        background: a.thumbnailUrl
                          ? `url(${a.thumbnailUrl}?w=600&h=400&fit=crop) center/cover no-repeat`
                          : a.gradient,
                      }}
                    />
                  </div>
                  <div>
                    <div className={s.jCat}>{a.cat}</div>
                    <div className={s.jTitle}>{a.title}</div>
                    <div className={s.jDate}>{a.date}</div>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className={s.newsSec} aria-label="お知らせ">
        <div className={s.inner}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.secEye}>News</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h2 className={s.secH2}>お知らせ</h2>
          </AnimateOnScroll>
          <div className={s.newsList}>
            {newsArticles.slice(0, 2).map((a) => (
              <AnimateOnScroll key={a.slug} animation="fadeUp" delay={120}>
                <Link href={`/journal/${a.slug}`} className={s.newsItem}>
                  <span className={s.newsDate}>{a.date}</span>
                  <span className={s.newsTitle}>{a.title}</span>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={s.ctaSec} aria-label="無料相談">
        <div className={s.inner}>
          <div className={s.ctaEye}>Free consultation</div>
          <AnimateOnScroll animation="fadeUp">
            <h2 className={s.ctaH}>まず、話してみませんか。</h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <p className={s.ctaSubText}>
              LINEから気軽にメッセージを。<br />概算の確認だけでも大歓迎です。
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={160}>
            <div className={s.ctaBtns}>
              <a href="https://lin.ee/tRn0iPk" target="_blank" rel="noopener noreferrer" className={s.ctaLine}>
                <span className={s.pip} />LINEで無料相談
              </a>
              <a href="https://calendar.app.google/ZN4YAQ4EKw7BZNDx9" target="_blank" rel="noopener noreferrer" className={s.ctaConsult}>相談を予約する</a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}

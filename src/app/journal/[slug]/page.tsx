import type { Metadata } from "next";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { ARTICLES, getArticleBySlug } from "@/lib/articles";
import s from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  return {
    title: `${article?.title ?? slug} | JOURNAL | ヒトカラウェディング`,
  };
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  const related = ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  const title = article?.title ?? "記事タイトル";
  const cat = article?.cat ?? "ノウハウ";
  const date = article?.date ?? "2025.06.01";
  const author = article?.author ?? "大久保 雄治";
  const gradient = article?.gradient ?? "linear-gradient(155deg,#8ab8d0,#4a7898)";

  return (
    <div className={s.layoutWrap}>
      <div className={s.jMain}>
        <div className={s.breadcrumb}>
          <Link href="/" className={s.bcLink}>TOP</Link>
          <span className={s.bcSep}>/</span>
          <Link href="/journal" className={s.bcLink}>Journal</Link>
          <span className={s.bcSep}>/</span>
          <span>{title}</span>
        </div>

        <article className={s.article}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.abCat}>{cat}</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h1 className={s.abTitle}>{title}</h1>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeIn" delay={160}>
            <div className={s.abMetaRow}>
              <div className={s.abAuthorAv}>{author[0]}</div>
              <span>{author}</span>
              <div className={s.abSep} />
              <span>{date}</span>
              <div className={s.abSep} />
              <span>読了5分</span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="scaleIn" delay={160}>
            <div className={s.abHero} style={{ background: gradient }} />
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp">
            <p className={s.abLead}>
              {article?.excerpt ??
                "鎌倉の神社・寺院で行う神前式は、凛とした空気の中で誓いを立てる特別な体験。古都の歴史と自然が織りなす空間で、和装のふたりが映えます。"}
            </p>
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

          <div className={s.abTagsRow}>
            <span className={s.abTag}>鎌倉</span>
            <span className={s.abTag}>和婚</span>
            <span className={s.abTag}>神前式</span>
            <span className={s.abTag}>{cat}</span>
          </div>
        </article>
      </div>

      {/* Sidebar */}
      <aside className={s.artSide}>
        <div className={s.sideCta}>
          <div className={s.sideCtaLbl}>Consultation</div>
          <div className={s.sideCtaH}>鎌倉エリアのプランナーに相談する</div>
          <a href="https://lin.ee/tRn0iPk" target="_blank" rel="noopener noreferrer" className={s.sideCtaBtn}>
            <span className={s.pip} />LINEで無料相談
          </a>
        </div>

        <span className={s.sideLbl}>関連記事</span>
        <div className={s.sideRecent}>
          {related.map((a) => (
            <Link href={`/journal/${a.slug}`} key={a.slug} className={s.srCard}>
              <div className={s.srImg} style={{ background: a.gradient }} />
              <div>
                <div className={s.srCat}>{a.cat}</div>
                <div className={s.srTitle}>{a.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

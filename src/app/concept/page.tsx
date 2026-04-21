import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ConceptStats from "@/components/ConceptStats";
import Breadcrumb from "@/components/Breadcrumb";
import s from "./page.module.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "コンセプト - 人から選ぶ、持ち込み自由・適正価格のウェディング",
  description:
    "ヒトカラウェディングのコンセプト。横浜・鎌倉エリアで、式場ではなく「人（クリエイター）」から選ぶ新しいウェディングスタイル。持ち込み自由・適正価格・透明な見積もりで、ふたりらしい結婚式をプロデュースします。鶴岡八幡宮・鎌倉宮での神前式にも対応。",
  alternates: {
    canonical: "https://hitokarawedding.com/concept",
  },
};

const PROBLEMS = [
  { num: "01", t: "情報の不透明さ", d: "担当者が誰かわからないまま契約させられる。顔も、想いも、スタイルも。" },
  { num: "02", t: "価格の不透明さ", d: "追加費用が積み重なり、最終金額が初期見積もりの1.8倍になることも珍しくない。" },
  { num: "03", t: "選択肢の少なさ", d: "決められたパッケージから選ぶしかなく、ふたりらしさを出す余地がない。" },
];

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

const FAQ_ITEMS = [
  {
    q: "横浜・鎌倉で持ち込み自由の結婚式はできますか？",
    a: "はい、ヒトカラウェディングでは横浜・鎌倉エリアのすべての提携会場で持ち込みが自由です。カメラマン、映像、ヘアメイク、装花、衣装など、すべてのクリエイターやアイテムを外部から持ち込むことができます。持ち込み料は一切かかりません。",
  },
  {
    q: "ヒトカラウェディングの結婚式の費用相場は？",
    a: "ゲスト人数やプラン内容によりますが、40名規模で約200万〜350万円が目安です。サイト内の見積もりシミュレーターでリアルタイムに概算を確認でき、表示された金額がそのまま最終金額になります。追加費用が後から発生することはありません。",
  },
  {
    q: "鶴岡八幡宮で結婚式を挙げられますか？",
    a: "はい、鶴岡八幡宮での神前式に対応しています。鎌倉宮をはじめ、鎌倉エリアの神社・寺院での挙式プランをご用意しており、挙式後の披露宴会場への手配もトータルでサポートします。",
  },
  {
    q: "フリーランスのカメラマンやヘアメイクを指名できますか？",
    a: "ヒトカラウェディングでは、すべてのクリエイター（プランナー・カメラマン・ヘアメイク・映像・司会・フラワー）の顔写真・作品・料金をサイト上で公開しています。気になるクリエイターを事前に確認し、直接指名して依頼できます。",
  },
  {
    q: "結婚式の見積もりはどうやって確認できますか？",
    a: "サイト内の見積もりシミュレーターで、ゲスト人数・会場・各クリエイターを選ぶだけでリアルタイムに合計金額を試算できます。会員登録不要・無料でご利用いただけます。詳しくはLINEからお気軽にご相談ください。",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function ConceptPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Breadcrumb items={[{ label: "Concept" }]} />
      {/* Hero */}
      <section className={s.cpHero} aria-label="コンセプト">
        <div className={s.cpHeroBg}>98<br />1.8</div>
        <div className={s.cpHeroInner}>
          <div className={s.cpHeroContent}>
            <AnimateOnScroll animation="slideRight">
              <span className={s.cpHeroEyebrow}>Concept &mdash; u.g.partners</span>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeUp" delay={80}>
              <h1 className={s.cpHeroH1}>
                <span style={{display:'inline-block',whiteSpace:'nowrap'}}>持ち込み自由・適正価格の</span><br />
                <span style={{display:'inline-block',whiteSpace:'nowrap'}}><em>ふたりらしい結婚式</em>を</span><br />
                <span style={{display:'inline-block',whiteSpace:'nowrap'}}>つくる。</span>
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeUp" delay={160}>
              <p className={s.cpHeroLead}>
                情報のわかりにくさ、価格の不透明さ、選択肢の少なさ。<br />
                ヒトカラウェディングは、そうした不安を減らし、<br />
                横浜・鎌倉エリアでちゃんと納得して選べる結婚式を増やすために生まれました。
              </p>
            </AnimateOnScroll>
          </div>
          <div className={s.cpHeroRight}>
            <AnimateOnScroll animation="fadeIn" delay={160}>
              <ConceptStats />
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className={s.cpBrand} aria-label="ブランドストーリー">
        <div className={s.cpBrandImg}>
          <span className={s.cpBrandImgLabel}>PHOTO AREA</span>
        </div>
        <div className={s.cpBrandBody}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.cpBrandEyebrow}>Brand Story</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h2 className={s.cpBrandH}>ここを<em>変えたかった</em>。</h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={160}>
            <p className={s.cpBrandP}>結婚式は、本来もっと自由で、もっと自分たちらしくていい。</p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={240}>
            <p className={s.cpBrandP}>
              私たちが目指しているのは、ただ式を実施することではなく、ふたりが納得して選び、心からやってよかったと思えるクオリティの高い結婚式を増やしていくことです。それが結果として、結婚式をしたいと思える人を増やし、結婚式の価値そのものをもう一度高めていくことにつながると考えています。
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Problem */}
      <section className={s.cpProb}>
        <div className={s.inner}>
          <div className={s.cpProbHead}>
            <AnimateOnScroll animation="slideRight">
              <span className={s.secEye}>The Problem</span>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeUp" delay={80}>
              <h2 className={s.secH2}>変えたい<em>3つの課題</em>。</h2>
            </AnimateOnScroll>
          </div>
          <div className={s.cpProbGrid}>
            {PROBLEMS.map((p, i) => (
              <AnimateOnScroll key={p.num} animation="fadeUp" delay={80 + i * 80}>
                <div className={s.cpProbItem}>
                  <div className={s.cpProbNum}>{p.num}</div>
                  <div>
                    <div className={s.cpProbT}>{p.t}</div>
                    <div className={s.cpProbD}>{p.d}</div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={s.cpVal}>
        <div className={s.inner}>
          <div className={s.cpValHead}>
            <AnimateOnScroll animation="slideRight">
              <span className={s.secEye}>Our Values</span>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeUp" delay={80}>
              <h2 className={s.secH2}>ヒトカラが<em>大切にすること</em>。</h2>
            </AnimateOnScroll>
          </div>
          <div className={s.cpValGrid}>
            {VALUES.map((v, i) => (
              <AnimateOnScroll key={v.num} animation="fadeUp" delay={80 + i * 80}>
                <div className={s.cpValCard}>
                  <div className={s.cpValNumRow}>
                    <div className={s.cpValNum}>{v.num}</div>
                    <div className={s.cpValTitle}>{v.title}</div>
                  </div>
                  <p className={s.cpValLead}>{v.lead}</p>
                  <p className={s.cpValDesc}>{v.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Message */}
      <section className={s.cpMsg}>
        <div className={s.inner}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.secEye}>From Founder</span>
          </AnimateOnScroll>
          <div className={s.cpMsgInner}>
            <AnimateOnScroll animation="fadeIn">
              <div className={s.cpMsgLeft}>
                <span className={s.cpMsgQuoteMark}>&ldquo;</span>
                <div className={s.cpMsgQuote}>
                  自分の結婚式で、担当者の顔を見て依頼できたなら、もっと安心できた。
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeUp" delay={160}>
              <div>
                <p className={s.cpMsgBody}>
                  自分たちの式を経験して、強くそう感じました。式に関わるすべての人を「人」として知れる仕組みが、もっと当たり前になってほしい。そのためにヒトカラウェディングを始めました。
                </p>
                <div className={s.cpMsgSig}>
                  <div className={s.cpMsgAv}>大</div>
                  <div>
                    <div className={s.cpMsgName}>大久保 雄治</div>
                    <div className={s.cpMsgTitle}>代表 / u.g.partners</div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={s.cpProb} aria-label="よくある質問">
        <div className={s.inner}>
          <div className={s.cpProbHead}>
            <AnimateOnScroll animation="slideRight">
              <span className={s.secEye}>FAQ</span>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeUp" delay={80}>
              <h2 className={s.secH2}>よくある<em>ご質問</em>。</h2>
            </AnimateOnScroll>
          </div>
          <div className={`${s.cpProbGrid} ${s.cpFaqGrid}`}>
            {FAQ_ITEMS.map((item, i) => (
              <AnimateOnScroll key={i} animation="fadeUp" delay={80 + i * 80}>
                <div className={`${s.cpProbItem} ${s.cpFaqItem}`}>
                  <div className={s.cpProbNum}>Q</div>
                  <div>
                    <div className={s.cpProbT}>{item.q}</div>
                    <div className={s.cpProbD}>{item.a}</div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
          <AnimateOnScroll animation="fadeUp" delay={160}>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link href="/simulation" className={s.cpCtaSubBtn}>見積もりシミュレーターを試す</Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className={s.cpCta}>
        <div className={s.inner}>
          <span className={s.cpCtaEye}>Free Consultation</span>
          <AnimateOnScroll animation="fadeUp">
            <h2 className={s.cpCtaH}>まずは、相談してみませんか？</h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <p className={s.cpCtaSub}>相談は無料。LINEから気軽にどうぞ。</p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={160}>
            <div className={s.cpCtaBtns}>
              <a href="https://lin.ee/tRn0iPk" target="_blank" rel="noopener noreferrer" className={s.cpCtaMain}>
                <span className={s.pip} />LINEで無料相談
              </a>
              <Link href="/creators" className={s.cpCtaSubBtn}>クリエイターを見る</Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}

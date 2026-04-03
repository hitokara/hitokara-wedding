import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import s from "./page.module.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CONCEPT | ヒトカラウェディング",
};

const PROBLEMS = [
  { num: "01", t: "情報の不透明さ", d: "担当者が誰かわからないまま契約させられる。顔も、想いも、スタイルも。" },
  { num: "02", t: "価格の不透明さ", d: "追加費用が積み重なり、最終金額が初期見積もりの1.8倍になることも珍しくない。" },
  { num: "03", t: "選択肢の少なさ", d: "決められたパッケージから選ぶしかなく、ふたりらしさを出す余地がない。" },
];

const VALUES = [
  { num: "01", label: "Value 01", t: "人で選べる", d: "すべてのクリエイターの顔・想い・料金を公開。打ち合わせ前に、ちゃんと知れる。" },
  { num: "02", label: "Value 02", t: "明朗会計", d: "シミュレーターで概算が一目でわかる。追加費用なし、持込自由で本当に納得できる式に。" },
  { num: "03", label: "Value 03", t: "横浜・鎌倉特化", d: "エリアを知り尽くしたクリエイターが、海と風を感じる特別な式をつくります。" },
];

const PROMISES = [
  { num: "01", t: "人を先に知れる", d: "契約前にクリエイターの顔・想い・実績・料金をすべて確認できます。" },
  { num: "02", t: "追加費用ゼロ", d: "シミュレーターの金額がそのまま最終金額。驚きの請求は一切ありません。" },
  { num: "03", t: "すべて持込可能", d: "料理・装花・映像・衣装、すべて外部からの持込に対応しています。" },
];

export default function ConceptPage() {
  return (
    <>
      {/* Hero */}
      <section className={s.cpHero}>
        <div className={s.cpHeroBg}>98<br />1.8</div>
        <div className={s.cpHeroContent}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.cpHeroEyebrow}>Concept &mdash; u.g.partners</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h1 className={s.cpHeroH1}>
              人から選べる、<br /><em>ふたりらしい</em><br />結婚式をつくる。
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={160}>
            <p className={s.cpHeroLead}>
              情報のわかりにくさ、価格の不透明さ、選択肢の少なさ。<br />
              ヒトカラウェディングは、そうした不安を減らし、<br />
              ちゃんと納得して選べる結婚式を増やすために生まれました。
            </p>
          </AnimateOnScroll>
        </div>
        <div className={s.cpHeroRight}>
          <AnimateOnScroll animation="fadeIn" delay={160}>
            <div className={s.cpHeroStats}>
              <div className={s.cpStat}>
                <div className={s.cpStatNum}>98%</div>
                <div className={s.cpStatDesc}>カップルが「打ち合わせ前に<br />担当者を知りたかった」と回答</div>
              </div>
              <div className={s.cpStat}>
                <div className={s.cpStatNum}>1.8&times;</div>
                <div className={s.cpStatDesc}>初期見積もりから最終費用が<br />平均1.8倍に膨らむことがある</div>
              </div>
              <div className={s.cpStat}>
                <div className={s.cpStatNum}>6h</div>
                <div className={s.cpStatDesc}>打ち合わせから決断を<br />迫られるまでの平均時間</div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Brand Story */}
      <section className={s.cpBrand}>
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
      </section>

      {/* Values */}
      <section className={s.cpVal}>
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
              <div className={s.cpValItem}>
                <div className={s.cpValNumBig}>{v.num}</div>
                <div>
                  <span className={s.cpValLabel}>{v.label}</span>
                  <div className={s.cpValT}>{v.t}</div>
                  <div className={s.cpValD}>{v.d}</div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Promise */}
      <section className={s.cpPromise}>
        <AnimateOnScroll animation="slideRight">
          <span className={s.secEye}>Our Promise</span>
        </AnimateOnScroll>
        <AnimateOnScroll animation="fadeUp" delay={80}>
          <h2 className={s.secH2}>3つの<em>約束</em>。</h2>
        </AnimateOnScroll>
        <div className={s.cpPromiseGrid}>
          {PROMISES.map((p, i) => (
            <AnimateOnScroll key={p.num} animation="fadeUp" delay={80 + i * 80}>
              <div className={s.cpPi}>
                <div className={s.cpPiNum}>{p.num}</div>
                <div>
                  <div className={s.cpPiT}>{p.t}</div>
                  <div className={s.cpPiD}>{p.d}</div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Founder Message */}
      <section className={s.cpMsg}>
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
      </section>

      {/* CTA */}
      <section className={s.cpCta}>
        <span className={s.cpCtaEye}>Free Consultation</span>
        <AnimateOnScroll animation="fadeUp">
          <h2 className={s.cpCtaH}>まず、クリエイターに会いにきてください。</h2>
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
      </section>
    </>
  );
}

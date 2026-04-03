"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { CATS, PLANNERS, CREATORS, FLOWER_MAIN, fmtP } from "@/lib/simulation";
import type { CategoryItem } from "@/lib/simulation";
import s from "./page.module.css";

interface AccData {
  id: string;
  idx: string;
  title: string;
  items: { id: string; label: string; price: number; unit?: string; note?: string }[];
}

function buildAccordionData(guests: number): AccData[] {
  return [
    { id: "planner", idx: "01", title: "プランニング", items: PLANNERS },
    { id: "venue", idx: "02", title: "会場", items: CATS[0].items },
    { id: "food", idx: "03", title: "料理・飲物", items: CATS[1].items },
    { id: "dress", idx: "04", title: "衣装", items: CATS[2].items },
    { id: "flower", idx: "05", title: "装花", items: FLOWER_MAIN },
    { id: "hair", idx: "06", title: "ヘアメイク", items: [CREATORS[3]] },
    { id: "mc", idx: "07", title: "司会", items: [CREATORS[2]] },
    { id: "photo", idx: "08", title: "写真", items: [CREATORS[0]] },
    { id: "video", idx: "09", title: "映像", items: [CREATORS[1]] },
  ];
}

function ChevSvg({ open }: { open: boolean }) {
  return (
    <svg className={`${s.accChev} ${open ? s.accChevOpen : ""}`} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5l4 4 4-4" />
    </svg>
  );
}

function ToggleChevSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4l3 3 3-3" />
    </svg>
  );
}

function AccordionSection({
  data,
  guests,
  selections,
  onSelect,
}: {
  data: AccData[];
  guests: number;
  selections: Record<string, string>;
  onSelect: (catId: string, itemId: string) => void;
}) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={s.accRoot}>
      {data.map((cat) => {
        const isOpen = openCats.has(cat.id);
        const sel = selections[cat.id];
        const selItem = cat.items.find((it) => it.id === sel);
        const price = selItem ? (selItem.unit === "\u4eba" ? selItem.price * guests : selItem.price) : 0;

        return (
          <div key={cat.id} className={s.accItem}>
            <div className={s.accHdr} onClick={() => toggle(cat.id)}>
              <span className={s.accIdx}>{cat.idx}</span>
              <span className={s.accLabel}>{cat.title}</span>
              <span className={`${s.accPrice} ${!sel ? s.accPricePending : ""}`}>
                {sel ? `\u00a5${fmtP(price)}` : "\u672a\u9078\u629e"}
              </span>
              <ChevSvg open={isOpen} />
            </div>
            {isOpen && (
              <div className={s.accBody}>
                <div className={s.optList}>
                  {cat.items.map((item) => {
                    const on = sel === item.id;
                    const displayPrice = item.unit === "\u4eba"
                      ? `\u00a5${fmtP(item.price)}/\u4eba`
                      : `\u00a5${fmtP(item.price)}`;
                    return (
                      <div
                        key={item.id}
                        className={`${s.opt} ${on ? s.optOn : ""}`}
                        onClick={() => onSelect(cat.id, item.id)}
                      >
                        <div className={s.optRadio}>
                          <div className={s.optDot} />
                        </div>
                        <div className={s.optInfo}>
                          <div className={s.optName}>{item.label}</div>
                          {item.note && <div className={s.optDesc}>{item.note}</div>}
                        </div>
                        <div className={`${s.optPrice} ${item.unit === "\u4eba" ? s.optPricePP : ""}`}>
                          {displayPrice}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SimulationPage() {
  const [guests, setGuests] = useState(40);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const accData = useMemo(() => buildAccordionData(guests), [guests]);

  const onSelect = useCallback((catId: string, itemId: string) => {
    setSelections((prev) => ({ ...prev, [catId]: itemId }));
  }, []);

  const breakdown = useMemo(() => {
    return accData.map((cat) => {
      const sel = selections[cat.id];
      const item = cat.items.find((it) => it.id === sel);
      const price = item ? (item.unit === "\u4eba" ? item.price * guests : item.price) : 0;
      return { id: cat.id, title: cat.title, price, selected: !!sel };
    });
  }, [accData, selections, guests]);

  const total = useMemo(() => breakdown.reduce((sum, b) => sum + b.price, 0), [breakdown]);
  const maxBudget = 5000000;
  const barWidth = Math.min((total / maxBudget) * 100, 100);

  return (
    <div className={s.simWrap}>
      {/* SP: Total Bar */}
      <div className={s.totalBar}>
        <div className={s.totalLabel}>概算</div>
        <div className={s.totalAmountWrap}>
          <span className={s.totalNum}>{fmtP(total)}</span>
          <span className={s.totalUnit}>&nbsp;円〜</span>
        </div>
        <div className={s.totalCta}>
          <a href="https://lin.ee/tRn0iPk" target="_blank" rel="noopener noreferrer" className={s.tctaLine}>
            <span className={s.pip} />LINEで送る
          </a>
        </div>
      </div>

      {/* SP: Breakdown Toggle */}
      <button
        className={`${s.breakdownToggle} ${breakdownOpen ? s.breakdownToggleOpen : ""}`}
        onClick={() => setBreakdownOpen(!breakdownOpen)}
      >
        <span>内訳を確認する</span>
        <ToggleChevSvg />
      </button>
      <div className={`${s.breakdownPanel} ${breakdownOpen ? s.breakdownPanelOpen : ""}`}>
        <div className={s.breakdownInner}>
          {breakdown.map((b) => (
            <div key={b.id} className={s.bkItem}>
              <span className={s.bkLabel}>{b.title}</span>
              <span className={`${s.bkPrice} ${!b.selected ? s.bkPricePending : ""}`}>
                {b.selected ? `\u00a5${fmtP(b.price)}` : "\u672a\u9078\u629e"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SP: Main Scrollable */}
      <div className={s.simMain}>
        <h1 className={s.pageH1}>結婚式費用の<em>見積もりシミュレーター</em></h1>
        <div className={s.guestsBlock}>
          <div className={s.gTop}>
            <div className={s.gLabel}>ゲスト人数</div>
            <div className={s.gValWrap}>
              <span className={s.gVal}>{guests}</span>
              <span className={s.gUnit}>名</span>
            </div>
          </div>
          <input
            type="range"
            className={s.rangeInput}
            min={10}
            max={100}
            value={guests}
            step={1}
            onChange={(e) => setGuests(Number(e.target.value))}
          />
        </div>
        <AccordionSection data={accData} guests={guests} selections={selections} onSelect={onSelect} />
      </div>

      {/* PC: Left Column */}
      <div className={s.simLeft}>
        <h1 className={s.pageH1}>結婚式費用の<em>見積もりシミュレーター</em></h1>
        <div className={s.guestsBlock}>
          <div className={s.gTop}>
            <div className={s.gLabel}>ゲスト人数</div>
            <div className={s.gValWrap}>
              <span className={s.gVal}>{guests}</span>
              <span className={s.gUnit}>名</span>
            </div>
          </div>
          <input
            type="range"
            className={s.rangeInput}
            min={10}
            max={100}
            value={guests}
            step={1}
            onChange={(e) => setGuests(Number(e.target.value))}
            style={{ width: "100%", marginBottom: 16 }}
          />
        </div>
        <AccordionSection data={accData} guests={guests} selections={selections} onSelect={onSelect} />
      </div>

      {/* PC: Right Column */}
      <div className={s.simRight}>
        <div className={s.rightInner}>
          <span className={s.rightLabel}>概算合計</span>
          <div className={s.rightAmountRow}>
            <div className={s.rightAmount}>{fmtP(total)}</div>
            <div className={s.rightUnit}>円</div>
          </div>
          <div className={s.rightNote}>
            {total === 0 ? "項目を選択すると合計が表示されます" : `ゲスト${guests}名の場合の概算です`}
          </div>
          <div className={s.rightBarWrap}>
            <div className={s.rightBar} style={{ width: `${barWidth}%` }} />
          </div>
        </div>
        <div className={s.rightBkLbl}>内訳</div>
        <div className={s.rightBreakdown}>
          {breakdown.map((b) => (
            <div key={b.id} className={s.rbItem}>
              <span className={s.rbLabel}>{b.title}</span>
              <span className={`${s.rbPrice} ${!b.selected ? s.rbPricePending : ""}`}>
                {b.selected ? `\u00a5${fmtP(b.price)}` : "\u672a\u9078\u629e"}
              </span>
            </div>
          ))}
        </div>
        <div className={s.rightCtas}>
          <a href="https://lin.ee/tRn0iPk" target="_blank" rel="noopener noreferrer" className={s.rCtaLine}>
            <span className={s.pip} />LINEで送って相談する
          </a>
          <Link href="#contact" className={s.rCtaConsult}>プランナーに直接相談</Link>
          <button className={s.rCtaPdf}>PDFで保存する</button>
          <div className={s.rDisclaimer}>※ プランニング料は含まれています。表示は参考金額です。</div>
        </div>
      </div>
    </div>
  );
}

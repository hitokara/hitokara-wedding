"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { fmtP } from "@/lib/simulation";
import { CREATORS_LIST } from "@/lib/creators";
import type { Creator } from "@/lib/creators";
import type { CategoryItem } from "@/lib/simulation";
import type { CMSCategoryGroup } from "@/lib/microcms";
import Breadcrumb from "@/components/Breadcrumb";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { trackEvent } from "@/lib/gtag";
import s from "./page.module.css";

const FAVS_STORAGE_KEY = "hitokara-favs";

async function generatePdf(el: HTMLElement) {
  const html2canvas = (await import("html2canvas-pro")).default;
  const { jsPDF } = await import("jspdf");

  // Make printSummary visible for capture
  el.style.display = "block";
  el.style.position = "absolute";
  el.style.left = "-9999px";
  el.style.width = "800px";

  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#fff" });

  el.style.display = "";
  el.style.position = "";
  el.style.left = "";
  el.style.width = "";

  const imgW = canvas.width;
  const imgH = canvas.height;
  const pdfW = 210; // A4 mm
  const pdfH = (imgH * pdfW) / imgW;
  const pdf = new jsPDF({ unit: "mm", format: [pdfW, pdfH] });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfW, pdfH);
  pdf.save("hitokara-simulation.pdf");
}

interface AccData {
  id: string;
  idx: string;
  title: string;
  items: CategoryItem[];
}

function buildAccordionData(categories: CMSCategoryGroup[]): AccData[] {
  return categories.map((cat, i) => ({
    id: cat.id,
    idx: String(i + 1).padStart(2, "0"),
    title: cat.title,
    items: cat.items,
  }));
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
  creatorNoms,
  onCreatorNom,
  cmsCreators,
}: {
  data: AccData[];
  guests: number;
  selections: Record<string, string>;
  onSelect: (catId: string, itemId: string) => void;
  creatorNoms: Record<string, string>;
  onCreatorNom: (catId: string, creatorId: string) => void;
  cmsCreators: Creator[];
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
        // For nomination items, use the nominated creator's price
        let price = 0;
        if (selItem) {
          if (selItem.nom === 1 && creatorNoms[cat.id]) {
            const crSource = cmsCreators.length > 0 ? cmsCreators : CREATORS_LIST;
            const nominated = crSource.find((c) => c.id === creatorNoms[cat.id]);
            price = nominated?.price ?? 0;
          } else {
            price = selItem.unit === "\u4eba" ? selItem.price * guests : selItem.price;
          }
        }

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
                    const displayPrice = item.nom === 1
                      ? "\u6307\u540d"
                      : item.unit === "\u4eba"
                        ? `\u00a5${fmtP(item.price)}/\u4eba`
                        : `\u00a5${fmtP(item.price)}`;
                    return (
                      <div key={item.id}>
                        <div
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
                          <div className={`${s.optPrice} ${item.nom === 1 ? s.optPricePP : item.unit === "\u4eba" ? s.optPricePP : ""}`}>
                            {displayPrice}
                          </div>
                        </div>
                        {/* Creator picker when nomination is selected */}
                        {on && item.nom === 1 && item.ck && (
                          <CreatorPicker
                            catKey={item.ck}
                            catId={cat.id}
                            selectedCreatorId={creatorNoms[cat.id] || ""}
                            onPick={onCreatorNom}
                            cmsCreators={cmsCreators}
                          />
                        )}
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

const CARD_GRADIENTS = [
  "linear-gradient(155deg,#8ab8d0,#4a7898)",
  "linear-gradient(155deg,#9ac8d8,#5898b8)",
  "linear-gradient(155deg,#7aa8c0,#3a6888)",
  "linear-gradient(155deg,#6898b8,#385878)",
];

function CreatorPicker({
  catKey,
  catId,
  selectedCreatorId,
  onPick,
  cmsCreators,
}: {
  catKey: string;
  catId: string;
  selectedCreatorId: string;
  onPick: (catId: string, creatorId: string) => void;
  cmsCreators: Creator[];
}) {
  const [favSet, setFavSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVS_STORAGE_KEY);
      if (stored) {
        const arr: string[] = JSON.parse(stored);
        if (Array.isArray(arr)) setFavSet(new Set(arr));
      }
    } catch {
      // ignore
    }
  }, []);

  // Use CMS creators (same IDs as localStorage favs), fallback to static
  const source = cmsCreators.length > 0 ? cmsCreators : CREATORS_LIST;
  const allCreators = source.filter((c) => c.cat === catKey);
  // Sort favorited creators first
  const creators = [...allCreators].sort((a, b) => {
    const aFav = favSet.has(a.id) ? 1 : 0;
    const bFav = favSet.has(b.id) ? 1 : 0;
    return bFav - aFav;
  });
  if (creators.length === 0) return null;

  return (
    <div className={s.crPicker}>
      <div className={s.crPickerLabel}>クリエイターを選択</div>
      <div className={s.crPickerTrack}>
        {creators.map((cr, i) => {
          const on = selectedCreatorId === cr.id;
          const isFav = favSet.has(cr.id);
          return (
            <div
              key={cr.id}
              className={`${s.crPickerCard} ${on ? s.crPickerCardOn : ""}`}
              onClick={() => onPick(catId, cr.id)}
            >
              <div className={s.crPickerImgWrap}>
                <div
                  className={s.crPickerImg}
                  style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
                />
                {isFav && (
                  <span className={s.crPickerFavBadge}>
                    <svg viewBox="0 0 24 24" fill="#e05c5c" stroke="#fff" strokeWidth="1" width="11" height="11">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    お気に入り
                  </span>
                )}
              </div>
              <div className={s.crPickerInfo}>
                <div className={s.crPickerName}>
                  {cr.name}
                </div>
                <div className={s.crPickerTags}>
                  {cr.tags.slice(0, 2).map((t) => (
                    <span key={t} className={s.crPickerTag}>{t}</span>
                  ))}
                </div>
                <div className={s.crPickerPrice}><span className={s.crPickerPriceUnit}>指名料&nbsp;</span>&yen;{cr.price.toLocaleString()}<span className={s.crPickerPriceUnit}>〜</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SimulationClient({
  categories,
  creators: cmsCreators,
}: {
  categories: CMSCategoryGroup[];
  creators: Creator[];
}) {
  const SIM_STORAGE_KEY = "hitokara-sim";
  const printRef = useRef<HTMLDivElement>(null);

  const [guests, setGuests] = useState(40);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [creatorNoms, setCreatorNoms] = useState<Record<string, string>>({});
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIM_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.guests) setGuests(data.guests);
        if (data.selections) setSelections(data.selections);
        if (data.creatorNoms) setCreatorNoms(data.creatorNoms);
      }
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(SIM_STORAGE_KEY, JSON.stringify({ guests, selections, creatorNoms }));
    } catch { /* ignore */ }
  }, [guests, selections, creatorNoms]);

  const accData = useMemo(() => buildAccordionData(categories), [categories]);

  const onSelect = useCallback((catId: string, itemId: string) => {
    setSelections((prev) => ({ ...prev, [catId]: itemId }));
    trackEvent("sim_select_item", { category: catId, item: itemId });
  }, []);

  const onCreatorNom = useCallback((catId: string, creatorId: string) => {
    setCreatorNoms((prev) => ({ ...prev, [catId]: creatorId }));
    trackEvent("sim_nominate_creator", { category: catId, creator_id: creatorId });
  }, []);

  const breakdown = useMemo(() => {
    const crSource = cmsCreators.length > 0 ? cmsCreators : CREATORS_LIST;
    return accData.map((cat) => {
      const sel = selections[cat.id];
      const item = cat.items.find((it) => it.id === sel);
      let price = 0;
      if (item) {
        if (item.nom === 1 && creatorNoms[cat.id]) {
          const nominated = crSource.find((c) => c.id === creatorNoms[cat.id]);
          price = nominated?.price ?? 0;
        } else {
          price = item.unit === "\u4eba" ? item.price * guests : item.price;
        }
      }
      return { id: cat.id, title: cat.title, price, selected: !!sel };
    });
  }, [accData, selections, guests, creatorNoms, cmsCreators]);

  const total = useMemo(() => breakdown.reduce((sum, b) => sum + b.price, 0), [breakdown]);
  const maxBudget = 5000000;
  const barWidth = Math.min((total / maxBudget) * 100, 100);

  const handlePdf = useCallback(() => {
    if (!printRef.current) return;
    trackEvent("sim_pdf_save", { total });
    generatePdf(printRef.current);
  }, [total]);

  return (
    <div className={s.simWrap}>
      {/* Print Summary (hidden on screen, used for PDF generation) */}
      <div className={s.printSummary} ref={printRef}>
        <div className={s.printHeader}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-header.jpg" alt="ヒトカラウェディング" className={s.printLogo} />
          <div className={s.printHeaderRight}>
            <div className={s.printHeaderTitle}>見積もりシミュレーション</div>
            <div className={s.printHeaderSub}>Estimate Simulation</div>
          </div>
        </div>
        <div className={s.printMeta}>
          <div className={s.printMetaItem}>
            <span className={s.printMetaLabel}>作成日時</span>
            <span className={s.printMetaValue}>
              {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
              {" "}{new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className={s.printMetaItem}>
            <span className={s.printMetaLabel}>ゲスト人数</span>
            <span className={s.printMetaValue}>{guests}名</span>
          </div>
        </div>
        <table className={s.printTable}>
          <thead>
            <tr>
              <th>カテゴリ</th>
              <th>選択内容</th>
              <th>金額（税別）</th>
            </tr>
          </thead>
          <tbody>
            {accData.map((cat) => {
              const sel = selections[cat.id];
              const selItem = cat.items.find((it) => it.id === sel);
              let price = 0;
              let label = "—";
              if (selItem) {
                label = selItem.label;
                if (selItem.nom === 1 && creatorNoms[cat.id]) {
                  const crSource = cmsCreators.length > 0 ? cmsCreators : CREATORS_LIST;
            const nominated = crSource.find((c) => c.id === creatorNoms[cat.id]);
                  price = nominated?.price ?? 0;
                  if (nominated) label += `（${nominated.name}）`;
                } else {
                  price = selItem.unit === "人" ? selItem.price * guests : selItem.price;
                }
              }
              return (
                <tr key={cat.id} className={sel ? "" : s.printRowEmpty}>
                  <td>{cat.title}</td>
                  <td>{label}</td>
                  <td>{sel ? `¥${price.toLocaleString()}` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className={s.printTotalSection}>
          <div className={s.printTotalRow}>
            <span>概算合計</span>
            <span className={s.printTotalAmount}>¥{total.toLocaleString()}</span>
          </div>
          <div className={s.printTotalUnit}>円（税別）</div>
        </div>
        <div className={s.printFooter}>
          <div className={s.printFooterNote}>
            ※ プランニング料は含まれています。表示は参考金額です。<br />
            ※ 実際の金額はお打ち合わせにて確定いたします。
          </div>
          <div className={s.printFooterBrand}>
            ヒトカラウェディング ｜ hitokarawedding.com<br />
            横浜・鎌倉のウェディングプロデュース
          </div>
        </div>
      </div>

      {/* SP: Total Bar */}
      <div className={s.totalBar}>
        <div className={s.totalLabel}>概算</div>
        <div className={s.totalAmountWrap}>
          <span className={s.totalNum}>{fmtP(total)}</span>
          <span className={s.totalUnit}>&nbsp;円〜</span>
        </div>
        <div className={s.totalCta}>
          <a href="https://lin.ee/tRn0iPk" target="_blank" rel="noopener noreferrer" className={s.tctaLine} onClick={() => trackEvent("cta_line", { location: "simulation_sp" })}>
            <span className={s.pip} />LINEで送る
          </a>
          <button className={s.tctaPdf} onClick={handlePdf}>PDF</button>
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
        <Breadcrumb items={[{ label: "Simulation" }]} />
        <div className={s.pageHdr}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.pageEye}>Simulation</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h1 className={s.pageH1}>見積もり<em>シミュレーター</em></h1>
          </AnimateOnScroll>
        </div>
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
        <AccordionSection data={accData} guests={guests} selections={selections} onSelect={onSelect} creatorNoms={creatorNoms} onCreatorNom={onCreatorNom} cmsCreators={cmsCreators} />
      </div>

      {/* PC: Left Column */}
      <div className={s.simLeft}>
        <Breadcrumb items={[{ label: "Simulation" }]} />
        <div className={s.pageHdr}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.pageEye}>Simulation</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h1 className={s.pageH1}>見積もり<em>シミュレーター</em></h1>
          </AnimateOnScroll>
        </div>
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
        <AccordionSection data={accData} guests={guests} selections={selections} onSelect={onSelect} creatorNoms={creatorNoms} onCreatorNom={onCreatorNom} cmsCreators={cmsCreators} />
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
          <a href="https://lin.ee/tRn0iPk" target="_blank" rel="noopener noreferrer" className={s.rCtaLine} onClick={() => trackEvent("cta_line", { location: "simulation_pc" })}>
            <span className={s.pip} />LINEで相談
          </a>
          <button className={s.rCtaConsult} onClick={handlePdf}>PDFで保存</button>
          <a
            href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://hitokarawedding.com/simulation')}&text=${encodeURIComponent(`見積もりシミュレーション結果: 合計 ¥${fmtP(total)}円（ゲスト${guests}名）`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={s.rCtaPdf}
          >
            LINEでシェア
          </a>
          <div className={s.rDisclaimer}>※ プランニング料は含まれています。表示は参考金額です。</div>
        </div>
      </div>
    </div>
  );
}

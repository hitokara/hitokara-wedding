"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { fmtP } from "@/lib/simulation";
import { CREATORS_LIST } from "@/lib/creators";
import type { Creator } from "@/lib/creators";
import type { CategoryItem } from "@/lib/simulation";
import type { CMSCategoryGroup, CMSVenue } from "@/lib/microcms";
import Breadcrumb from "@/components/Breadcrumb";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { trackEvent } from "@/lib/gtag";
import s from "./page.module.css";

const FAVS_STORAGE_KEY = "hitokara-favs";

/** Wait until all <img> inside el have loaded (or errored) so html2canvas snapshots complete images */
async function waitForImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight > 0) return resolve();
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          // Safety timeout
          setTimeout(done, 4000);
        })
    )
  );
}

async function renderPrintCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas-pro")).default;
  // Mobile: lower scale to avoid iOS Safari canvas-size / memory limits
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const scale = isMobile ? 1.5 : 2;

  el.style.display = "block";
  el.style.position = "absolute";
  el.style.left = "-9999px";
  el.style.top = "0";
  el.style.width = "800px";
  try {
    await waitForImages(el);
    const canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#fff",
      logging: false,
    });
    return canvas;
  } finally {
    el.style.display = "";
    el.style.position = "";
    el.style.left = "";
    el.style.top = "";
    el.style.width = "";
  }
}

/** Download or share a Blob robustly across desktop/iOS/Android */
async function shareOrDownload(blob: Blob, filename: string, mime: string, title: string): Promise<void> {
  const file = new File([blob], filename, { type: mime });

  // 1) Web Share API (iOS 15+, Android Chrome): opens native share sheet (Save to Files/Photos etc.)
  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return;
    } catch (e) {
      const name = (e as { name?: string })?.name;
      if (name === "AbortError") return; // User cancelled
      // Other errors: fall through to download fallback
    }
  }

  // 2) Fallback: blob URL
  const url = URL.createObjectURL(blob);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  if (isIOS) {
    // iOS Safari: open in new tab; user uses Safari's share button to save
    window.open(url, "_blank");
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

async function generatePdf(el: HTMLElement): Promise<void> {
  try {
    const { jsPDF } = await import("jspdf");
    const canvas = await renderPrintCanvas(el);

    const A4_W = 210;
    const A4_H = 297;
    const M = 12;
    const contentW = A4_W - M * 2;
    const imgW = canvas.width;
    const imgH = canvas.height;
    if (imgW === 0 || imgH === 0) throw new Error("canvas is empty");
    const scaledH = (imgH * contentW) / imgW;
    const fitH = Math.min(scaledH, A4_H - M * 2);
    const fitW = fitH === scaledH ? contentW : (imgW * fitH) / imgH;
    const offsetX = (A4_W - fitW) / 2;

    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.85);
    pdf.addImage(imgData, "JPEG", offsetX, M, fitW, fitH);
    const blob = pdf.output("blob");
    await shareOrDownload(blob, "hitokara-simulation.pdf", "application/pdf", "見積もりシミュレーション");
  } catch (e) {
    console.error("PDF save error:", e);
    alert("PDFの保存に失敗しました。通信状況を確認して、もう一度お試しください。");
  }
}

async function generateImage(el: HTMLElement): Promise<void> {
  try {
    const canvas = await renderPrintCanvas(el);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.88)
    );
    if (!blob) throw new Error("toBlob returned null");
    await shareOrDownload(blob, "hitokara-simulation.jpg", "image/jpeg", "見積もりシミュレーション");
  } catch (e) {
    console.error("Image save error:", e);
    alert("画像の保存に失敗しました。通信状況を確認して、もう一度お試しください。");
  }
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

/* ---- Price helpers ---- */

/** Menu selection map: catId -> creatorId -> menuIds[] */
type MenuSelMap = Record<string, Record<string, string[]>>;

/** Compute number of tables from guest count: ceil((guests + 6) / 8) */
function tableCount(guests: number): number {
  return Math.ceil((guests + 6) / 8);
}

/** Resolve base price for a nom item when no creator is selected */
function baseNomPrice(item: CategoryItem, guests: number): number {
  return item.unit === "\u4eba" ? item.price * guests : item.price;
}

/** Resolve nominated creator price (creator price overrides base; menu selection overrides creator price) */
function nomPrice(
  catId: string,
  item: CategoryItem,
  guests: number,
  creatorNoms: Record<string, string[]>,
  crSource: Creator[],
  menuSels: MenuSelMap,
): number {
  const ids = creatorNoms[catId] ?? [];
  if (ids.length === 0) return baseNomPrice(item, guests); // base price when no creator
  return ids.reduce((sum, id) => {
    const cr = crSource.find((c) => c.id === id);
    if (!cr) return sum;
    const selMenus = menuSels[catId]?.[id] ?? [];
    if (cr.menus && cr.menus.length > 0 && selMenus.length > 0) {
      const menuTotal = selMenus.reduce((s, mid) => {
        const menu = cr.menus!.find((m) => m.id === mid);
        return s + (menu?.price ?? 0);
      }, 0);
      return sum + menuTotal;
    }
    return sum + cr.price;
  }, 0);
}

function itemPrice(
  catId: string,
  item: CategoryItem | undefined,
  guests: number,
  creatorNoms: Record<string, string[]>,
  crSource: Creator[],
  menuSels: MenuSelMap,
  venues: CMSVenue[],
  selectedVenue: string | null,
): number {
  if (!item) return 0;
  if (item.nom === 1) return nomPrice(catId, item, guests, creatorNoms, crSource, menuSels);
  if (item.vp === 1) {
    if (selectedVenue) {
      const v = venues.find((ve) => ve.id === selectedVenue);
      // If venue has explicit price, use it. Otherwise fall back to item base.
      return v?.price ?? item.price;
    }
    return item.price;
  }
  // Special: 装花 flower_set = メイン 100k + ゲスト 10k × 卓数 + ブーケ 50k
  if (item.unit === "flower_set") {
    return 100000 + 10000 * tableCount(guests) + 50000;
  }
  return item.unit === "\u4eba" ? item.price * guests : item.price;
}

/* ---- Category alias & role filter ---- */

const CAT_ALIAS: Record<string, string[]> = {
  photo: ["photo", "photo_movie"],
  movie: ["movie", "photo_movie"],
  mc: ["mc"],
  sound: ["sound", "music"],
  gift: ["gift"],
  dress: ["dress", "stylist"],
  item: ["item", "designer"],
  other: ["other", "party", "captain"],
};

const ROLE_FILTER: Record<string, RegExp> = {
  photo: /photo|camera|photograph/i,
  movie: /video|videograph|movie|cinema/i,
};

function catMatches(creatorCat: string, pickerCatKey: string): boolean {
  if (creatorCat === pickerCatKey) return true;
  const pickerAliases = CAT_ALIAS[pickerCatKey];
  if (pickerAliases?.includes(creatorCat)) return true;
  for (const [merged, aliases] of Object.entries(CAT_ALIAS)) {
    if (aliases.includes(pickerCatKey) && creatorCat === merged) return true;
  }
  return false;
}

function filterCreators(allCreators: Creator[], catKey: string): Creator[] {
  const matched = allCreators.filter((c) => catMatches(c.cat, catKey));
  const roleRx = ROLE_FILTER[catKey];
  if (!roleRx) return matched;
  return matched.filter((c) => roleRx.test(c.role));
}

const CARD_GRADIENTS = [
  "linear-gradient(155deg,#8ab8d0,#4a7898)",
  "linear-gradient(155deg,#9ac8d8,#5898b8)",
  "linear-gradient(155deg,#7aa8c0,#3a6888)",
  "linear-gradient(155deg,#6898b8,#385878)",
];

/* ---- CreatorPicker ---- */

function CreatorPicker({
  catKey,
  catId,
  selectedIds,
  onPick,
  cmsCreators,
  multi,
}: {
  catKey: string;
  catId: string;
  selectedIds: string[];
  onPick: (catId: string, creatorId: string, multi: boolean) => void;
  cmsCreators: Creator[];
  multi: boolean;
}) {
  const [favSet, setFavSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVS_STORAGE_KEY);
      if (stored) {
        const arr: string[] = JSON.parse(stored);
        if (Array.isArray(arr)) setFavSet(new Set(arr));
      }
    } catch { /* ignore */ }
  }, []);

  const source = cmsCreators.length > 0 ? cmsCreators : CREATORS_LIST;
  const creators = filterCreators(source, catKey).sort((a, b) => {
    const aFav = favSet.has(a.id) ? 1 : 0;
    const bFav = favSet.has(b.id) ? 1 : 0;
    return bFav - aFav;
  });
  if (creators.length === 0) return null;

  const selectedSet = new Set(selectedIds);

  return (
    <div className={s.crPicker}>
      <div className={s.crPickerLabel}>
        {multi ? "\u30AF\u30EA\u30A8\u30A4\u30BF\u30FC\u3092\u9078\u629E\uFF08\u8907\u6570\u53EF\uFF09" : "\u30AF\u30EA\u30A8\u30A4\u30BF\u30FC\u3092\u9078\u629E"}
      </div>
      <div className={s.crPickerTrack}>
        {creators.map((cr, i) => {
          const on = selectedSet.has(cr.id);
          const isFav = favSet.has(cr.id);
          const imgUrl = cr.images?.[0]?.url;
          const bg = imgUrl
            ? `url(${imgUrl}?w=480&h=480&fit=crop&fm=webp&q=85) center/cover no-repeat`
            : CARD_GRADIENTS[i % CARD_GRADIENTS.length];
          return (
            <div
              key={cr.id}
              className={`${s.crPickerCard} ${on ? s.crPickerCardOn : ""}`}
              onClick={() => onPick(catId, cr.id, multi)}
            >
              <div className={s.crPickerImgWrap}>
                <div className={s.crPickerImg} style={{ background: bg }} />
                {on && (
                  <span className={s.crPickerCheck}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="14" height="14">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                {isFav && (
                  <span className={s.crPickerFavBadge}>
                    <svg viewBox="0 0 24 24" fill="#e05c5c" stroke="#fff" strokeWidth="1" width="11" height="11">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </span>
                )}
              </div>
              <div className={s.crPickerInfo}>
                <div className={s.crPickerName}>{cr.name}</div>
                <div className={s.crPickerRole}>{cr.role}</div>
                <div className={s.crPickerPrice}>
                  <span className={s.crPickerPriceUnit}>{"\u6599\u91D1\u00A0"}</span>
                  &yen;{cr.price.toLocaleString()}
                  <span className={s.crPickerPriceUnit}>{"\u301C"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- VenuePicker ---- */

function VenuePicker({
  venues,
  selectedId,
  onPick,
}: {
  venues: CMSVenue[];
  selectedId: string | null;
  onPick: (venueId: string) => void;
}) {
  if (venues.length === 0) {
    return <div className={s.crPicker}><div className={s.crPickerLabel}>登録されている会場はまだありません</div></div>;
  }

  return (
    <div className={s.crPicker}>
      <div className={s.crPickerLabel}>会場を選択</div>
      <div className={s.crPickerTrack}>
        {venues.map((v, i) => {
          const on = selectedId === v.id;
          const imgUrl = v.image?.url;
          const bg = imgUrl
            ? `url(${imgUrl}?w=480&h=480&fit=crop&fm=webp&q=85) center/cover no-repeat`
            : CARD_GRADIENTS[i % CARD_GRADIENTS.length];
          return (
            <div
              key={v.id}
              className={`${s.crPickerCard} ${on ? s.crPickerCardOn : ""}`}
              onClick={() => onPick(v.id)}
            >
              <div className={s.crPickerImgWrap}>
                <div className={s.crPickerImg} style={{ background: bg }} />
                {on && (
                  <span className={s.crPickerCheck}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="14" height="14">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              <div className={s.crPickerInfo}>
                <div className={s.crPickerName}>{v.name}</div>
                <div className={s.crPickerRole}>
                  {[v.area, v.capacity ? `〜${v.capacity}` : ""].filter(Boolean).join(" / ")}
                </div>
                {typeof v.price === "number" && v.price > 0 && (
                  <div className={s.crPickerPrice}>
                    &yen;{v.price.toLocaleString()}
                    <span className={s.crPickerPriceUnit}>{"\u00A0〜"}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- AccordionSection ---- */

function AccordionSection({
  data,
  guests,
  selections,
  onSelect,
  creatorNoms,
  onCreatorNom,
  cmsCreators,
  venues,
  selectedVenue,
  onVenuePick,
  menuSels,
  onMenuToggle,
}: {
  data: AccData[];
  guests: number;
  selections: Record<string, string>;
  onSelect: (catId: string, itemId: string) => void;
  creatorNoms: Record<string, string[]>;
  onCreatorNom: (catId: string, creatorId: string, multi: boolean) => void;
  cmsCreators: Creator[];
  venues: CMSVenue[];
  selectedVenue: string | null;
  onVenuePick: (venueId: string) => void;
  menuSels: MenuSelMap;
  onMenuToggle: (catId: string, creatorId: string, menuId: string) => void;
}) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());
  const crSource = cmsCreators.length > 0 ? cmsCreators : CREATORS_LIST;

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
        const price = itemPrice(cat.id, selItem, guests, creatorNoms, crSource, menuSels, venues, selectedVenue);
        const isVenueRow = selItem?.vp === 1 && selectedVenue && price > 0;

        return (
          <div key={cat.id} className={s.accItem}>
            <div className={s.accHdr} onClick={() => toggle(cat.id)}>
              <span className={s.accIdx}>{cat.idx}</span>
              <span className={s.accLabel}>{cat.title}</span>
              <span className={`${s.accPrice} ${!sel ? s.accPricePending : ""}`}>
                {sel ? `\u00a5${fmtP(price)}${isVenueRow ? "\u301C" : ""}` : "\u672a\u9078\u629e"}
              </span>
              <ChevSvg open={isOpen} />
            </div>
            {isOpen && (
              <div className={s.accBody}>
                <div className={s.optList}>
                  {cat.items.map((item) => {
                    const on = sel === item.id;
                    const displayPrice = item.nom === 1
                      ? (item.price > 0
                          ? (item.unit === "\u4eba" ? `\u00a5${fmtP(item.price)}/\u4eba〜` : `\u00a5${fmtP(item.price)}〜`)
                          : "\u6307\u540d")
                      : item.unit === "\u4eba"
                        ? `\u00a5${fmtP(item.price)}/\u4eba`
                        : item.unit === "flower_set"
                          ? `\u00a5${fmtP(100000 + 10000 * Math.ceil((guests + 6) / 8) + 50000)}`
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
                        {on && item.nom === 1 && item.ck && (
                          <>
                            <CreatorPicker
                              catKey={item.ck}
                              catId={cat.id}
                              selectedIds={creatorNoms[cat.id] ?? []}
                              onPick={onCreatorNom}
                              cmsCreators={cmsCreators}
                              multi={!!item.multi}
                            />
                            {(creatorNoms[cat.id] ?? []).map((crId) => {
                              const cr = crSource.find((c) => c.id === crId);
                              if (!cr || !cr.menus || cr.menus.length === 0) return null;
                              const selMenus = menuSels[cat.id]?.[crId] ?? [];
                              return (
                                <div key={crId} className={s.menuSelBox}>
                                  <div className={s.menuSelHead}>
                                    <span className={s.menuSelCrName}>{cr.name}</span>
                                    <span className={s.menuSelLabel}>メニューを選択（複数可）</span>
                                  </div>
                                  <div className={s.menuSelList}>
                                    {cr.menus.map((m) => {
                                      const on2 = selMenus.includes(m.id);
                                      return (
                                        <label
                                          key={m.id}
                                          className={`${s.menuSelItem} ${on2 ? s.menuSelItemOn : ""}`}
                                          onClick={(e) => { e.preventDefault(); onMenuToggle(cat.id, crId, m.id); }}
                                        >
                                          <span className={s.menuSelCheck}>
                                            {on2 && (
                                              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="10" height="10">
                                                <path d="M5 13l4 4L19 7" />
                                              </svg>
                                            )}
                                          </span>
                                          <div className={s.menuSelInfo}>
                                            <div className={s.menuSelName}>{m.name}</div>
                                            {m.includes && (
                                              <div className={s.menuSelIncludes}>
                                                {m.includes.split(/[\n、,]/).map((t) => t.trim()).filter(Boolean).join(" / ")}
                                              </div>
                                            )}
                                          </div>
                                          <div className={s.menuSelPrice}>¥{m.price.toLocaleString()}</div>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        )}
                        {on && item.vp === 1 && (
                          <VenuePicker
                            venues={venues}
                            selectedId={selectedVenue}
                            onPick={onVenuePick}
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

/* ---- Main Component ---- */

export default function SimulationClient({
  categories,
  creators: cmsCreators,
  venues = [],
}: {
  categories: CMSCategoryGroup[];
  creators: Creator[];
  venues?: CMSVenue[];
}) {
  const SIM_STORAGE_KEY = "hitokara-sim";
  const printRef = useRef<HTMLDivElement>(null);

  const [guests, setGuests] = useState(40);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [creatorNoms, setCreatorNoms] = useState<Record<string, string[]>>({});
  const [menuSels, setMenuSels] = useState<MenuSelMap>({});
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const hasTrackedStartRef = useRef(false);
  const completedMilestonesRef = useRef<Set<number>>(new Set());

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIM_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.guests) setGuests(data.guests);
        if (data.selections) setSelections(data.selections);
        if (data.creatorNoms) {
          // Migrate old format (string) to new (string[])
          const noms: Record<string, string[]> = {};
          for (const [k, v] of Object.entries(data.creatorNoms)) {
            noms[k] = Array.isArray(v) ? v as string[] : [v as string];
          }
          setCreatorNoms(noms);
        }
        if (data.selectedVenue) setSelectedVenue(data.selectedVenue);
        if (data.menuSels) setMenuSels(data.menuSels);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIM_STORAGE_KEY, JSON.stringify({ guests, selections, creatorNoms, selectedVenue, menuSels }));
    } catch { /* ignore */ }
  }, [guests, selections, creatorNoms, selectedVenue, menuSels]);

  const accData = useMemo(() => buildAccordionData(categories), [categories]);

  const onSelect = useCallback((catId: string, itemId: string) => {
    setSelections((prev) => {
      // Fire sim_start only on the first selection of the session
      if (!hasTrackedStartRef.current && Object.keys(prev).length === 0) {
        trackEvent("sim_start", { guests });
        hasTrackedStartRef.current = true;
      }
      return { ...prev, [catId]: itemId };
    });
    // Clear creator nominations & menu selections when switching
    setCreatorNoms((prev) => {
      const next = { ...prev };
      delete next[catId];
      return next;
    });
    setMenuSels((prev) => {
      const next = { ...prev };
      delete next[catId];
      return next;
    });
    // Clear venue selection when switching venue options
    if (catId === "venue") setSelectedVenue(null);
    trackEvent("sim_select_item", { category: catId, item: itemId });
  }, [guests]);

  const onMenuToggle = useCallback((catId: string, creatorId: string, menuId: string) => {
    setMenuSels((prev) => {
      const catMap = { ...(prev[catId] ?? {}) };
      const current = catMap[creatorId] ?? [];
      const has = current.includes(menuId);
      catMap[creatorId] = has ? current.filter((id) => id !== menuId) : [...current, menuId];
      return { ...prev, [catId]: catMap };
    });
    trackEvent("sim_select_menu", { category: catId, creator_id: creatorId, menu_id: menuId });
  }, []);

  const onVenuePick = useCallback((venueId: string) => {
    setSelectedVenue((prev) => (prev === venueId ? null : venueId));
    trackEvent("sim_select_venue", { venue_id: venueId });
  }, []);

  const onCreatorNom = useCallback((catId: string, creatorId: string, multi: boolean) => {
    setCreatorNoms((prev) => {
      const current = prev[catId] ?? [];
      if (multi) {
        // Toggle: add if not present, remove if present
        const has = current.includes(creatorId);
        return { ...prev, [catId]: has ? current.filter((id) => id !== creatorId) : [...current, creatorId] };
      }
      // Single select: replace
      return { ...prev, [catId]: [creatorId] };
    });
    // When single-select replaces or toggle-removes, clear associated menu selection
    setMenuSels((prev) => {
      const catMap = { ...(prev[catId] ?? {}) };
      const current = creatorNoms[catId] ?? [];
      if (multi) {
        if (current.includes(creatorId)) delete catMap[creatorId];
      } else {
        // single: clear all menu selections under this category
        return { ...prev, [catId]: {} };
      }
      return { ...prev, [catId]: catMap };
    });
    trackEvent("sim_nominate_creator", { category: catId, creator_id: creatorId });
  }, [creatorNoms]);

  const crSource = cmsCreators.length > 0 ? cmsCreators : CREATORS_LIST;

  const breakdown = useMemo(() => {
    return accData.map((cat) => {
      const sel = selections[cat.id];
      const item = cat.items.find((it) => it.id === sel);
      const price = itemPrice(cat.id, item, guests, creatorNoms, crSource, menuSels, venues, selectedVenue);
      const variable = item?.vp === 1 && !!selectedVenue && price > 0;
      return { id: cat.id, title: cat.title, price, selected: !!sel, variable };
    });
  }, [accData, selections, guests, creatorNoms, crSource, menuSels, venues, selectedVenue]);

  const total = useMemo(() => breakdown.reduce((sum, b) => sum + b.price, 0), [breakdown]);
  const maxBudget = 5000000;
  const barWidth = Math.min((total / maxBudget) * 100, 100);

  // Completion milestone events (25% / 50% / 75% / 100% of categories filled)
  useEffect(() => {
    const total = accData.length || 1;
    const filled = breakdown.filter((b) => b.selected).length;
    const pct = Math.round((filled / total) * 100);
    const thresholds = [25, 50, 75, 100];
    for (const t of thresholds) {
      if (pct >= t && !completedMilestonesRef.current.has(t)) {
        completedMilestonesRef.current.add(t);
        trackEvent("sim_progress", {
          percent: t,
          filled,
          total_categories: total,
        });
      }
    }
    if (filled === total && !completedMilestonesRef.current.has(999)) {
      completedMilestonesRef.current.add(999);
      const nomCount = Object.values(creatorNoms).reduce((s, ids) => s + ids.length, 0);
      trackEvent("sim_complete", {
        total_price: total,
        guests,
        creators_nominated: nomCount,
      });
    }
  }, [breakdown, accData.length, creatorNoms, guests]);

  const handlePdf = useCallback(() => {
    if (!printRef.current) return;
    const filled = breakdown.filter((b) => b.selected).length;
    const nomCount = Object.values(creatorNoms).reduce((s, ids) => s + ids.length, 0);
    const nomIds = Object.values(creatorNoms).flat().join(",");
    trackEvent("sim_pdf_download", {
      total_price: total,
      guests,
      categories_filled: filled,
      categories_total: accData.length,
      creators_nominated: nomCount,
      creator_ids: nomIds.slice(0, 100), // GA4 param cap 100 chars
      has_venue: selectedVenue ? 1 : 0,
    });
    // Keep legacy event for backward compatibility
    trackEvent("sim_pdf_save", { total });
    generatePdf(printRef.current);
  }, [total, breakdown, creatorNoms, guests, accData.length, selectedVenue]);

  // Image-save fallback kept for future use. Currently SP/PC both use PDF.
  void generateImage;

  /** Resolve label + price for PDF row */
  function pdfRow(cat: AccData) {
    const sel = selections[cat.id];
    const selItem = cat.items.find((it) => it.id === sel);
    if (!selItem) return { label: "\u2014", price: 0 };
    let label = selItem.label;
    let price = 0;
    if (selItem.nom === 1) {
      const ids = creatorNoms[cat.id] ?? [];
      if (ids.length === 0) {
        // No creator selected: use base price
        price = selItem.unit === "\u4eba" ? selItem.price * guests : selItem.price;
      } else {
        const parts: string[] = [];
        price = ids.reduce((s, id) => {
          const cr = crSource.find((c) => c.id === id);
          if (!cr) return s;
          const selMenus = menuSels[cat.id]?.[id] ?? [];
          if (cr.menus && cr.menus.length > 0 && selMenus.length > 0) {
            const menuNames = selMenus.map((mid) => cr.menus!.find((m) => m.id === mid)?.name).filter(Boolean);
            const sub = selMenus.reduce((ss, mid) => ss + (cr.menus!.find((m) => m.id === mid)?.price ?? 0), 0);
            parts.push(`${cr.name}・${menuNames.join("/")}`);
            return s + sub;
          }
          parts.push(cr.name);
          return s + cr.price;
        }, 0);
        if (parts.length > 0) label += `\uFF08${parts.join("\u3001")}\uFF09`;
      }
    } else if (selItem.vp === 1) {
      if (selectedVenue) {
        const v = venues.find((ve) => ve.id === selectedVenue);
        if (v) {
          label += `\uFF08${v.name}\uFF09`;
          price = v.price ?? selItem.price;
        }
      } else {
        price = selItem.price;
      }
    } else if (selItem.unit === "flower_set") {
      price = 100000 + 10000 * Math.ceil((guests + 6) / 8) + 50000;
    } else {
      price = selItem.unit === "\u4eba" ? selItem.price * guests : selItem.price;
    }
    return { label, price };
  }

  return (
    <div className={s.simWrap}>
      {/* PDF Summary (hidden) */}
      <div className={s.printSummary} ref={printRef}>
        <div className={s.printHeader}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-header.jpg" alt="\u30D2\u30C8\u30AB\u30E9\u30A6\u30A7\u30C7\u30A3\u30F3\u30B0" className={s.printLogo} />
          <div className={s.printHeaderRight}>
            <div className={s.printHeaderTitle}>{"\u898B\u7A4D\u3082\u308A\u30B7\u30DF\u30E5\u30EC\u30FC\u30B7\u30E7\u30F3"}</div>
            <div className={s.printHeaderSub}>Estimate Simulation</div>
          </div>
        </div>

        <div className={s.printMeta}>
          <div className={s.printMetaItem}>
            <span className={s.printMetaLabel}>{"\u4F5C\u6210\u65E5\u6642"}</span>
            <span className={s.printMetaValue}>
              {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
              {" "}{new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className={s.printMetaItem}>
            <span className={s.printMetaLabel}>{"\u30B2\u30B9\u30C8\u4EBA\u6570"}</span>
            <span className={s.printMetaValue}>{guests}{"\u540D"}</span>
          </div>
        </div>

        <div className={s.printItems}>
          {accData.map((cat) => {
            const sel = selections[cat.id];
            const selItem = cat.items.find((it) => it.id === sel);
            const row = pdfRow(cat);
            const variable = selItem?.vp === 1 && !!selectedVenue && row.price > 0;
            return (
              <div key={cat.id} className={`${s.printItem} ${!sel ? s.printItemEmpty : ""}`}>
                <div className={s.printItemIdx}>{cat.idx}</div>
                <div className={s.printItemBody}>
                  <div className={s.printItemTitle}>{cat.title}</div>
                  <div className={s.printItemLabel}>{row.label}</div>
                </div>
                <div className={s.printItemPrice}>
                  {sel ? `\u00A5${fmtP(row.price)}${variable ? "\u301C" : ""}` : "\u2014"}
                </div>
              </div>
            );
          })}
        </div>

        <div className={s.printTotalSection}>
          <div className={s.printTotalRow}>
            <span>{"\u6982\u7B97\u5408\u8A08"}</span>
            <span className={s.printTotalAmount}>&yen;{total.toLocaleString()}</span>
          </div>
          <div className={s.printTotalUnit}>{"\u5186\uFF08\u7A0E\u5225\uFF09"}</div>
        </div>

        <div className={s.printFooter}>
          <div className={s.printFooterNote}>
            {"\u203B \u30D7\u30E9\u30F3\u30CB\u30F3\u30B0\u6599\u306F\u542B\u307E\u308C\u3066\u3044\u307E\u3059\u3002\u8868\u793A\u306F\u53C2\u8003\u91D1\u984D\u3067\u3059\u3002"}<br />
            {"\u203B \u5B9F\u969B\u306E\u91D1\u984D\u306F\u304A\u6253\u3061\u5408\u308F\u305B\u306B\u3066\u78BA\u5B9A\u3044\u305F\u3057\u307E\u3059\u3002"}
          </div>
          <div className={s.printFooterBrand}>
            {"\u30D2\u30C8\u30AB\u30E9\u30A6\u30A7\u30C7\u30A3\u30F3\u30B0 \uFF5C hitokarawedding.com"}<br />
            {"\u6A2A\u6D5C\u30FB\u938C\u5009\u306E\u30A6\u30A7\u30C7\u30A3\u30F3\u30B0\u30D7\u30ED\u30C7\u30E5\u30FC\u30B9"}
          </div>
        </div>
      </div>

      {/* SP: Total Bar */}
      <div className={s.totalBar}>
        <div className={s.totalBarLeft}>
          <div className={s.totalLabel}>概算</div>
          <div className={s.totalAmountWrap}>
            <span className={s.totalNum}>{fmtP(total)}</span>
            <span className={s.totalUnit}>&nbsp;円〜</span>
          </div>
        </div>
        <div className={s.totalCta}>
          <a href="https://lin.ee/tRn0iPk" target="_blank" rel="noopener noreferrer" className={s.tctaLine} onClick={() => trackEvent("cta_line", { location: "simulation_sp" })}>
            <span className={s.pip} />LINE相談
          </a>
          <button className={s.tctaSave} onClick={handlePdf} aria-label="PDFで保存">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M3 13v3a1 1 0 001 1h12a1 1 0 001-1v-3M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5"/></svg>
            PDF
          </button>
        </div>
      </div>

      {/* SP: Breakdown Toggle */}
      <button
        className={`${s.breakdownToggle} ${breakdownOpen ? s.breakdownToggleOpen : ""}`}
        onClick={() => setBreakdownOpen(!breakdownOpen)}
      >
        <span>{"\u5185\u8A33\u3092\u78BA\u8A8D\u3059\u308B"}</span>
        <ToggleChevSvg />
      </button>
      <div className={`${s.breakdownPanel} ${breakdownOpen ? s.breakdownPanelOpen : ""}`}>
        <div className={s.breakdownInner}>
          {breakdown.map((b) => (
            <div key={b.id} className={s.bkItem}>
              <span className={s.bkLabel}>{b.title}</span>
              <span className={`${s.bkPrice} ${!b.selected ? s.bkPricePending : ""}`}>
                {b.selected ? `\u00a5${fmtP(b.price)}${b.variable ? "\u301C" : ""}` : "\u672a\u9078\u629e"}
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
            <h1 className={s.pageH1}>{"\u898B\u7A4D\u3082\u308A"}<em>{"\u30B7\u30DF\u30E5\u30EC\u30FC\u30BF\u30FC"}</em></h1>
          </AnimateOnScroll>
        </div>
        <div className={s.guestsBlock}>
          <div className={s.gTop}>
            <div className={s.gLabel}>{"\u30B2\u30B9\u30C8\u4EBA\u6570"}</div>
            <div className={s.gValWrap}>
              <span className={s.gVal}>{guests}</span>
              <span className={s.gUnit}>{"\u540D"}</span>
            </div>
          </div>
          <input
            type="range"
            className={s.rangeInput}
            min={10}
            max={100}
            value={guests}
            step={1}
            onChange={(e) => setGuests(Number(e.target.value))} onPointerUp={() => trackEvent("sim_guests_change", { guests })} onBlur={() => trackEvent("sim_guests_change", { guests })}
          />
        </div>
        <AccordionSection data={accData} guests={guests} selections={selections} onSelect={onSelect} creatorNoms={creatorNoms} onCreatorNom={onCreatorNom} cmsCreators={cmsCreators} venues={venues} selectedVenue={selectedVenue} onVenuePick={onVenuePick} menuSels={menuSels} onMenuToggle={onMenuToggle} />
      </div>

      {/* PC: Left Column */}
      <div className={s.simLeft}>
        <Breadcrumb items={[{ label: "Simulation" }]} />
        <div className={s.pageHdr}>
          <AnimateOnScroll animation="slideRight">
            <span className={s.pageEye}>Simulation</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeUp" delay={80}>
            <h1 className={s.pageH1}>{"\u898B\u7A4D\u3082\u308A"}<em>{"\u30B7\u30DF\u30E5\u30EC\u30FC\u30BF\u30FC"}</em></h1>
          </AnimateOnScroll>
        </div>
        <div className={s.guestsBlock}>
          <div className={s.gTop}>
            <div className={s.gLabel}>{"\u30B2\u30B9\u30C8\u4EBA\u6570"}</div>
            <div className={s.gValWrap}>
              <span className={s.gVal}>{guests}</span>
              <span className={s.gUnit}>{"\u540D"}</span>
            </div>
          </div>
          <input
            type="range"
            className={s.rangeInput}
            min={10}
            max={100}
            value={guests}
            step={1}
            onChange={(e) => setGuests(Number(e.target.value))} onPointerUp={() => trackEvent("sim_guests_change", { guests })} onBlur={() => trackEvent("sim_guests_change", { guests })}
            style={{ width: "100%", marginBottom: 16 }}
          />
        </div>
        <AccordionSection data={accData} guests={guests} selections={selections} onSelect={onSelect} creatorNoms={creatorNoms} onCreatorNom={onCreatorNom} cmsCreators={cmsCreators} venues={venues} selectedVenue={selectedVenue} onVenuePick={onVenuePick} menuSels={menuSels} onMenuToggle={onMenuToggle} />
      </div>

      {/* PC: Right Column */}
      <div className={s.simRight}>
        <div className={s.rightInner}>
          <span className={s.rightLabel}>{"\u6982\u7B97\u5408\u8A08"}</span>
          <div className={s.rightAmountRow}>
            <div className={s.rightAmount}>{fmtP(total)}</div>
            <div className={s.rightUnit}>{"\u5186"}</div>
          </div>
          <div className={s.rightNote}>
            {total === 0 ? "\u9805\u76EE\u3092\u9078\u629E\u3059\u308B\u3068\u5408\u8A08\u304C\u8868\u793A\u3055\u308C\u307E\u3059" : `\u30B2\u30B9\u30C8${guests}\u540D\u306E\u5834\u5408\u306E\u6982\u7B97\u3067\u3059`}
          </div>
          <div className={s.rightBarWrap}>
            <div className={s.rightBar} style={{ width: `${barWidth}%` }} />
          </div>
        </div>
        <div className={s.rightBkLbl}>{"\u5185\u8A33"}</div>
        <div className={s.rightBreakdown}>
          {breakdown.map((b) => (
            <div key={b.id} className={s.rbItem}>
              <span className={s.rbLabel}>{b.title}</span>
              <span className={`${s.rbPrice} ${!b.selected ? s.rbPricePending : ""}`}>
                {b.selected ? `\u00a5${fmtP(b.price)}${b.variable ? "\u301C" : ""}` : "\u672a\u9078\u629e"}
              </span>
            </div>
          ))}
        </div>
        <div className={s.rightCtas}>
          <a href="https://lin.ee/tRn0iPk" target="_blank" rel="noopener noreferrer" className={s.rCtaLine} onClick={() => trackEvent("cta_line", { location: "simulation_pc" })}>
            <span className={s.pip} />LINEで相談
          </a>
          <div className={s.rCtaRow}>
            <button className={s.rCtaSave} onClick={handlePdf}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M6 2h8v5H6zM3 7h14v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path d="M10 10v5m0 0l-2-2m2 2l2-2"/></svg>
              PDFで保存
            </button>
            <a
              href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://hitokarawedding.com/simulation')}&text=${encodeURIComponent(`見積もりシミュレーション結果: 合計 ¥${fmtP(total)}円（ゲスト${guests}名）`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={s.rCtaShare}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M15 8a3 3 0 100-6 3 3 0 000 6zM5 13a3 3 0 100-6 3 3 0 000 6zM15 18a3 3 0 100-6 3 3 0 000 6zM7.5 11.5l5-3M7.5 8.5l5 3"/></svg>
              シェア
            </a>
          </div>
          <div className={s.rDisclaimer}>※ プランニング料は含まれています。表示は参考金額です。</div>
        </div>
      </div>
    </div>
  );
}

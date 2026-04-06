"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { FILTER_CATS } from "@/lib/creators";
import type { Creator } from "@/lib/creators";
import s from "./page.module.css";

const STORAGE_KEY = "hitokara-favs";

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

function CreatorDetail({ cr, favs, toggleFav, gradient }: {
  cr: Creator;
  favs: Set<string>;
  toggleFav: (id: string) => void;
  gradient: string;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  // Main photo + works photos in a single slider
  const slides = [
    gradient,
    gradient.replace("#8ab8d0", "#9ac8d8").replace("#4a7898", "#5898b8"),
    gradient.replace("#8ab8d0", "#7aa8c0").replace("#4a7898", "#4a7898"),
    gradient.replace("#8ab8d0", "#aad0e0").replace("#4a7898", "#6aa8c8"),
  ];

  const handleScroll = () => {
    const el = sliderRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveSlide(idx);
  };

  const goToSlide = (idx: number) => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.offsetWidth, behavior: "smooth" });
  };

  return (
    <>
      {/* Photo strip: horizontal scroll of square photos */}
      <div className={s.modalImgWrap}>
        <div className={s.modalSlider} ref={sliderRef} onScroll={handleScroll}>
          {slides.map((bg, i) => (
            <div key={i} className={s.modalSlide} style={{ background: bg }} />
          ))}
        </div>
        <span className={s.modalCatBadge}>{cr.catLabel}</span>
      </div>

      <div className={s.modalBody}>
        {/* Name + heart + price row */}
        <div className={s.modalNameRow}>
          <div className={s.modalNameGroup}>
            <div className={s.modalNameInner}>
              <div className={s.modalName}>{cr.name}</div>
              <button
                className={`${s.modalFavInline} ${favs.has(cr.id) ? s.modalFavInlineOn : ""}`}
                onClick={(e) => { e.stopPropagation(); toggleFav(cr.id); }}
                aria-label="お気に入り"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill={favs.has(cr.id) ? "#e05c5c" : "none"} stroke={favs.has(cr.id) ? "#e05c5c" : "var(--t2)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
            <div className={s.modalRole}>{cr.role}</div>
          </div>
          <div className={s.modalPriceChip}>
            <span className={s.modalPriceLbl}>指名料</span>
            <span className={s.modalPriceVal}>&yen;{cr.price.toLocaleString()}</span>
            <span className={s.modalPriceUnit}>〜</span>
          </div>
        </div>

        <div className={s.modalTags}>
          {cr.tags.map((t) => <span key={t} className={s.modalTag}>{t}</span>)}
        </div>

        {/* MBTI & Likes side by side */}
        {(cr.mbti || cr.likes) && (
          <div className={s.modalInfoGrid}>
            {cr.mbti && (
              <div className={s.modalInfoItem}>
                <span className={s.modalInfoLbl}>MBTI</span>
                <span className={s.modalInfoVal}>{cr.mbti}</span>
              </div>
            )}
            {cr.likes && (
              <div className={s.modalInfoItem}>
                <span className={s.modalInfoLbl}>好きなこと</span>
                <span className={s.modalInfoVal}>{cr.likes}</span>
              </div>
            )}
          </div>
        )}

        <p className={s.modalProfile}>{cr.profile}</p>

        {cr.weddingThought && (
          <div className={s.modalThought}>
            <div className={s.modalThoughtDeco}>&ldquo;</div>
            <span className={s.modalThoughtLbl}>結婚式への想い</span>
            <p className={s.modalThoughtTxt}>{cr.weddingThought}</p>
          </div>
        )}
      </div>

      <div className={s.modalBtns}>
        <a href="https://example.com" target="_blank" rel="noopener noreferrer" className={s.modalBtnMain}>
          この人に相談する
        </a>
      </div>
    </>
  );
}

interface CreatorsClientProps {
  creators: Creator[];
}

export default function CreatorsClient({ creators }: CreatorsClientProps) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [favs, setFavs] = useState<Set<string>>(() => {
    const init = new Set<string>();
    creators.forEach((c) => { if (c.fav) init.add(c.id); });
    return init;
  });
  const [modalOpen, setModalOpen] = useState(false);

  // Lock body scroll when SP modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => { document.body.style.overflow = ""; document.body.style.touchAction = ""; };
  }, [modalOpen]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const arr: string[] = JSON.parse(stored);
        if (Array.isArray(arr) && arr.length > 0) {
          setFavs(new Set(arr));
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const toggleFav = useCallback((id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const filtered = filter === "all" ? creators : creators.filter((c) => c.cat === filter);
  const selectedCr = creators.find((c) => c.id === selected);

  const openDetail = (id: string) => {
    setSelected(id);
    // On SP, open modal
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setModalOpen(true);
    }
  };

  return (
    <div className={s.pageOuter}>
      <div className={s.main}>
        <div className={s.leftCol}>
          <div className={s.pageHdr}>
            <div className={s.pageHdrRow}>
              <div>
                <span className={s.pageEye}>Meet our creators</span>
                <h1 className={s.pageH1}>ウェディング<em>クリエイター</em></h1>
              </div>
            </div>
          </div>

          <div className={s.filterBar}>
            {FILTER_CATS.map((fc) => (
              <button
                key={fc.key}
                className={`${s.fBtn} ${filter === fc.key ? s.fBtnOn : ""}`}
                onClick={() => setFilter(fc.key)}
              >
                {fc.label}
              </button>
            ))}
          </div>

          <div className={s.gridArea}>
            <div className={s.grid}>
              {filtered.map((cr, i) => (
                <div
                  key={cr.id}
                  className={`${s.crCard} ${selected === cr.id ? s.crCardActive : ""}`}
                  onClick={() => openDetail(cr.id)}
                >
                  <div className={s.crCardImg}>
                    <div className={s.crCardImgBg} style={{ background: GRADIENTS[i % GRADIENTS.length] }} />
                    <div className={s.crCardGrad} />
                    <span className={s.crCardCat}>{cr.catLabel}</span>
                    <button
                      className={`${s.crCardFav} ${favs.has(cr.id) ? s.crCardFavOn : ""}`}
                      onClick={(e) => { e.stopPropagation(); toggleFav(cr.id); }}
                    >
                      <svg viewBox="0 0 24 24" width="12" height="12" fill={favs.has(cr.id) ? "#e05c5c" : "none"} stroke={favs.has(cr.id) ? "#e05c5c" : "rgba(255,255,255,.75)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>
                  <div className={s.crCardBody}>
                    <div className={s.crCardRole}>{cr.role}</div>
                    <div className={s.crCardName}>{cr.name}</div>
                    <div className={s.crCardPrice}>指名料 &yen;{cr.price.toLocaleString()}〜</div>
                    <div className={s.crCardTags}>
                      {cr.tags.map((t) => <span key={t} className={s.crCardTag}>{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel (PC only) */}
        <div className={s.rightPanel}>
          {!selectedCr ? (
            <div className={s.panelEmpty}>
              <div className={s.panelEmptyIcon}>&darr;</div>
              <div className={s.panelEmptyT}>クリエイターを選んで詳細を確認</div>
              <div className={s.panelEmptyD}>左のカードをクリックすると<br />詳細がここに表示されます</div>
            </div>
          ) : (
            <div className={`${s.panelDetail} ${s.panelDetailActive}`}>
              <CreatorDetail
                cr={selectedCr}
                favs={favs}
                toggleFav={toggleFav}
                gradient={GRADIENTS[creators.indexOf(selectedCr) % GRADIENTS.length]}
              />
            </div>
          )}
        </div>
      </div>

      {/* SP Modal */}
      <div
        className={`${s.modalOverlay} ${modalOpen ? s.modalOverlayOpen : ""}`}
        onClick={() => setModalOpen(false)}
      >
        <div className={s.modalSp} onClick={(e) => e.stopPropagation()}>
          <div className={s.modalHandle} />
          <button className={s.modalClose} onClick={() => setModalOpen(false)}>&times;</button>
          {selectedCr && (
            <CreatorDetail
              cr={selectedCr}
              favs={favs}
              toggleFav={toggleFav}
              gradient={GRADIENTS[creators.indexOf(selectedCr) % GRADIENTS.length]}
            />
          )}
        </div>
      </div>
    </div>
  );
}

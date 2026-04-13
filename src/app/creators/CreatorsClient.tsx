"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { FILTER_CATS } from "@/lib/creators";
import type { Creator } from "@/lib/creators";
import Breadcrumb from "@/components/Breadcrumb";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { trackEvent } from "@/lib/gtag";
import s from "./page.module.css";

const STORAGE_KEY = "hitokara-favs";

/** YouTube / Vimeo URL → embed URL */
function getEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  // YouTube
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
  }
  // Vimeo
  const vmMatch = trimmed.match(
    /vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)/
  );
  if (vmMatch) {
    return `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1`;
  }
  return null;
}

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

function CreatorDetail({ cr, favs, toggleFav, gradient, onOpenVideo }: {
  cr: Creator;
  favs: Set<string>;
  toggleFav: (id: string) => void;
  gradient: string;
  onOpenVideo: (cr: Creator) => void;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  // CMS images + works combined, fallback to gradients
  const cmsImages = [...(cr.images || []), ...(cr.works || [])];
  const slides: { type: "img" | "grad"; value: string }[] =
    cmsImages.length > 0
      ? cmsImages.map((img) => ({ type: "img" as const, value: img.url }))
      : [gradient, gradient.replace("#8ab8d0", "#9ac8d8")].map((g) => ({ type: "grad" as const, value: g }));

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
      {/* Photo slider */}
      <div className={s.modalImgWrap}>
        <div className={s.modalSlider} ref={sliderRef} onScroll={handleScroll}>
          {slides.map((sl, i) => (
            sl.type === "img"
              ? <div key={i} className={s.modalSlide} style={{ backgroundImage: `url(${sl.value})` }} />
              : <div key={i} className={s.modalSlide} style={{ background: sl.value }} />
          ))}
        </div>
        <span className={s.modalCatBadge}>{cr.catLabel}</span>
        {/* Navigation arrows (PC) */}
        {activeSlide > 0 && (
          <button className={`${s.slideArrow} ${s.slideArrowL}`} onClick={() => goToSlide(activeSlide - 1)} aria-label="前の写真">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}
        {activeSlide < slides.length - 1 && (
          <button className={`${s.slideArrow} ${s.slideArrowR}`} onClick={() => goToSlide(activeSlide + 1)} aria-label="次の写真">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}
        {/* Dots */}
        <div className={s.slideDots}>
          {slides.map((_, i) => (
            <button key={i} className={`${s.slideDot} ${i === activeSlide ? s.slideDotOn : ""}`} onClick={() => goToSlide(i)} />
          ))}
        </div>
        {/* Slide counter */}
        <span className={s.slideCount}>{activeSlide + 1} / {slides.length}</span>
      </div>

      <div className={s.modalBody}>
        <div className={s.modalNameRow}>
          <div className={s.modalNameGroup}>
            <div className={s.modalName}>{cr.name}</div>
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

        {/* Sample video button (only when URL exists) */}
        {getEmbedUrl(cr.sampleVideoUrl) && (
          <button
            type="button"
            className={s.videoBtn}
            onClick={(e) => {
              e.stopPropagation();
              onOpenVideo(cr);
            }}
            aria-label="サンプル動画を見る"
          >
            <span className={s.videoBtnIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className={s.videoBtnText}>
              {cr.sampleVideoTitle || "サンプル動画を見る"}
            </span>
            <svg className={s.videoBtnArrow} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        )}

        {cr.weddingThought && (
          <div className={s.modalThought}>
            <div className={s.modalThoughtDeco}>&ldquo;</div>
            <span className={s.modalThoughtLbl}>結婚式への想い</span>
            <p className={s.modalThoughtTxt}>{cr.weddingThought}</p>
          </div>
        )}
      </div>

      <div className={s.modalBtns}>
        <a
          href={cr.snsInstagram || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`${s.modalBtnMain} ${!cr.snsInstagram ? s.modalBtnDisabled : ""}`}
          onClick={(e) => { if (!cr.snsInstagram) { e.preventDefault(); } else { trackEvent("creator_sns_click", { creator_id: cr.id }); } }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><circle cx="17.5" cy="6.5" r=".9" fill="currentColor" stroke="none"/>
          </svg>
          SNSを見る
        </a>
        <button
          className={`${s.modalBtnFav} ${favs.has(cr.id) ? s.modalBtnFavOn : ""}`}
          onClick={(e) => { e.stopPropagation(); toggleFav(cr.id); }}
          aria-label="お気に入り"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill={favs.has(cr.id) ? "#e05c5c" : "none"} stroke={favs.has(cr.id) ? "#e05c5c" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
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
  const [videoCreator, setVideoCreator] = useState<Creator | null>(null);

  // SP swipe-down-to-close state
  const modalSpRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const openVideo = useCallback((cr: Creator) => {
    setVideoCreator(cr);
    trackEvent("creator_video_play", { creator_id: cr.id });
  }, []);

  const closeVideo = useCallback(() => setVideoCreator(null), []);

  // Close video with Escape
  useEffect(() => {
    if (!videoCreator) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeVideo(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [videoCreator, closeVideo]);

  // Touch handlers for swipe-down-to-close (SP modal)
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Only start drag if the inner scrollable body is scrolled to top
    const bodyEl = modalSpRef.current?.querySelector<HTMLElement>(`.${s.modalBody}`);
    if (bodyEl && bodyEl.scrollTop > 0) return;
    dragStartYRef.current = e.touches[0].clientY;
    setDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    const delta = e.touches[0].clientY - dragStartYRef.current;
    if (delta > 0) {
      setDragOffset(delta);
    } else {
      setDragOffset(0);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragOffset > 100) {
      setModalOpen(false);
    }
    dragStartYRef.current = null;
    setDragging(false);
    setDragOffset(0);
  }, [dragOffset]);

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

  // Auto-open creator modal from ?id= query param (e.g. from top page link)
  const searchParams = useSearchParams();
  useEffect(() => {
    const id = searchParams.get("id");
    if (id && creators.some((c) => c.id === id)) {
      setSelected(id);
      setModalOpen(true);
    }
  }, [searchParams, creators]);

  const toggleFav = useCallback((id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      const adding = !next.has(id);
      if (adding) next.add(id); else next.delete(id);
      trackEvent("creator_favorite", { creator_id: id, action: adding ? "add" : "remove" });
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
    trackEvent("creator_view_detail", { creator_id: id });
    // On SP, open modal
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setModalOpen(true);
    }
  };

  return (
    <div className={s.pageOuter}>
      <div className={s.main}>
        <div className={s.leftCol}>
          <Breadcrumb items={[{ label: "Creators" }]} />
          <div className={s.pageHdr}>
            <AnimateOnScroll animation="slideRight">
              <span className={s.pageEye}>Creators</span>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeUp" delay={80}>
              <h1 className={s.pageH1}>ウェディング<em>クリエイター</em></h1>
            </AnimateOnScroll>
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
                    <div className={s.crCardImgBg} style={
                      cr.images?.[0]
                        ? { backgroundImage: `url(${cr.images[0].url})` }
                        : { background: GRADIENTS[i % GRADIENTS.length] }
                    } />
                    <div className={s.crCardGrad} />
                    <span className={s.crCardCat}>{cr.catLabel}</span>
                    <button
                      className={`${s.crCardFav} ${favs.has(cr.id) ? s.crCardFavOn : ""}`}
                      onClick={(e) => { e.stopPropagation(); toggleFav(cr.id); }}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill={favs.has(cr.id) ? "#e05c5c" : "none"} stroke={favs.has(cr.id) ? "#e05c5c" : "rgba(255,255,255,.75)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,.2))" }}>
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
                onOpenVideo={openVideo}
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
        <div
          className={s.modalSp}
          ref={modalSpRef}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{
            transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
            transition: dragging ? "none" : undefined,
          }}
        >
          <div className={s.modalHandle} />
          <button className={s.modalClose} onClick={() => setModalOpen(false)} aria-label="閉じる">&times;</button>
          {selectedCr && (
            <CreatorDetail
              cr={selectedCr}
              favs={favs}
              toggleFav={toggleFav}
              gradient={GRADIENTS[creators.indexOf(selectedCr) % GRADIENTS.length]}
              onOpenVideo={openVideo}
            />
          )}
        </div>
      </div>

      {/* Video Modal (lazy-mounted iframe) */}
      {videoCreator && (
        <div
          className={`${s.videoOverlay} ${s.videoOverlayOpen}`}
          onClick={closeVideo}
          role="dialog"
          aria-modal="true"
          aria-label="サンプル動画"
        >
          <div className={s.videoFrameWrap} onClick={(e) => e.stopPropagation()}>
            <button className={s.videoClose} onClick={closeVideo} aria-label="動画を閉じる">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            {getEmbedUrl(videoCreator.sampleVideoUrl) && (
              <iframe
                src={getEmbedUrl(videoCreator.sampleVideoUrl)!}
                title={videoCreator.sampleVideoTitle || `${videoCreator.name} サンプル動画`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )}
            {videoCreator.sampleVideoTitle && (
              <div className={s.videoCaption}>{videoCreator.sampleVideoTitle}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

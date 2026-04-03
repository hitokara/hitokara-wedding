"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CREATORS_LIST, FILTER_CATS } from "@/lib/creators";
import type { Creator } from "@/lib/creators";
import s from "./page.module.css";

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
  return (
    <>
      <div className={s.modalImgWrap}>
        <div className={s.modalImgBg} style={{ background: gradient }} />
        <div className={s.modalImgGrad} />
        <span className={s.modalCatBadge}>{cr.catLabel}</span>
        <button
          className={`${s.modalFavBtn} ${favs.has(cr.id) ? s.modalFavBtnOn : ""}`}
          onClick={(e) => { e.stopPropagation(); toggleFav(cr.id); }}
        >
          {favs.has(cr.id) ? "\u2764" : "\u2661"}
        </button>
      </div>
      <div className={s.modalBody}>
        <div className={s.modalName}>{cr.name}</div>
        <div className={s.modalRole}>{cr.role}</div>
        <div className={s.modalTags}>
          {cr.tags.map((t) => <span key={t} className={s.modalTag}>{t}</span>)}
        </div>
        <div className={s.modalPriceRow}>
          <span className={s.modalPriceLbl}>参考価格</span>
          <span className={s.modalPriceVal}>&yen;{cr.price.toLocaleString()}</span>
          <span className={s.modalPriceUnit}>〜</span>
        </div>
        <span className={s.modalSecLbl}>Profile</span>
        <p className={s.modalProfile}>{cr.profile}</p>
        <span className={s.modalSecLbl}>Works</span>
        <div className={s.modalWorks}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={s.modalWork}>
              <div className={s.modalWorkInner} style={{ background: gradient }} />
            </div>
          ))}
        </div>
      </div>
      <div className={s.modalBtns}>
        <a href="https://lin.ee/tRn0iPk" target="_blank" rel="noopener noreferrer" className={s.modalBtnMain}>
          <span className={s.pip} />この人に相談する
        </a>
        <Link href="/simulation" className={s.modalBtnSim}>シミュレーターで見積もり</Link>
      </div>
    </>
  );
}

export default function CreatorsPage() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [favs, setFavs] = useState<Set<string>>(() => {
    const init = new Set<string>();
    CREATORS_LIST.forEach((c) => { if (c.fav) init.add(c.id); });
    return init;
  });
  const [modalOpen, setModalOpen] = useState(false);

  const toggleFav = useCallback((id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filtered = filter === "all" ? CREATORS_LIST : CREATORS_LIST.filter((c) => c.cat === filter);
  const selectedCr = CREATORS_LIST.find((c) => c.id === selected);

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
                <h1 className={s.pageH1}>横浜・鎌倉の<br />ウェディング<em>クリエイター</em></h1>
              </div>
              <div style={{ textAlign: "right", paddingTop: 8 }}>
                <div className={s.totalCount}>{filtered.length}</div>
                <div className={s.totalLabel}>Creators</div>
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
                      {favs.has(cr.id) ? "\u2764" : "\u2661"}
                    </button>
                  </div>
                  <div className={s.crCardBody}>
                    <div className={s.crCardRole}>{cr.role}</div>
                    <div className={s.crCardName}>{cr.name}</div>
                    <div className={s.crCardPrice}>&yen;{cr.price.toLocaleString()}</div>
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
                gradient={GRADIENTS[CREATORS_LIST.indexOf(selectedCr) % GRADIENTS.length]}
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
              gradient={GRADIENTS[CREATORS_LIST.indexOf(selectedCr) % GRADIENTS.length]}
            />
          )}
        </div>
      </div>
    </div>
  );
}

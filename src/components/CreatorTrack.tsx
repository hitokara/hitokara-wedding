"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./CreatorTrack.module.css";

interface CreatorData {
  id: string;
  name: string;
  role: string;
  catLabel: string;
  tags: string[];
  images?: { url: string }[];
}

interface CreatorTrackProps {
  creators: CreatorData[];
  gradients: string[];
  styles: Record<string, string>;
}

export default function CreatorTrack({ creators, gradients, styles: s }: CreatorTrackProps) {
  // Duplicate creators for seamless loop
  const doubled = [...creators, ...creators];
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Wait until layout is stable before starting (images, font loading)
    let raf = 0;
    let last = 0;
    let paused = false;
    let userInteracting = false;
    let resumeTimer: number | null = null;
    const SPEED = 0.6; // px / frame at 60fps ≈ 36 px/sec

    const startResumeTimer = (delay: number) => {
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        userInteracting = false;
        paused = false;
        resumeTimer = null;
      }, delay);
    };

    // Use setInterval for stable cadence (rAF can be throttled)
    let stop = false;
    const step = () => {
      if (stop) return;
      raf = requestAnimationFrame(() => {
        if (!paused && !userInteracting && document.visibilityState === "visible") {
          const half = wrap.scrollWidth / 2;
          if (half > 0) {
            const next = wrap.scrollLeft + SPEED;
            if (next >= half) {
              wrap.scrollLeft = next - half;
            } else {
              wrap.scrollLeft = next;
            }
          }
        }
        step();
      });
    };
    // Defer start until after first paint so scrollWidth is reliable
    const startId = window.setTimeout(() => {
      step();
    }, 200);

    // User pause helpers
    const pauseForInteraction = () => {
      userInteracting = true;
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };

    const onPointerDown = () => pauseForInteraction();
    const onPointerUp = () => startResumeTimer(2500);
    const onMouseEnter = () => pauseForInteraction();
    const onMouseLeave = () => startResumeTimer(800);
    const onWheel = () => {
      pauseForInteraction();
      startResumeTimer(1500);
    };

    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("pointerup", onPointerUp);
    wrap.addEventListener("pointercancel", onPointerUp);
    wrap.addEventListener("mouseenter", onMouseEnter);
    wrap.addEventListener("mouseleave", onMouseLeave);
    wrap.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      if (startId) window.clearTimeout(startId);
      if (resumeTimer) window.clearTimeout(resumeTimer);
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointerup", onPointerUp);
      wrap.removeEventListener("pointercancel", onPointerUp);
      wrap.removeEventListener("mouseenter", onMouseEnter);
      wrap.removeEventListener("mouseleave", onMouseLeave);
      wrap.removeEventListener("wheel", onWheel);
    };
    // last is referenced for type completeness
    void last;
  }, []);

  return (
    <div ref={wrapRef} className={styles.trackWrapper}>
      <div className={styles.trackInner}>
        {doubled.map((cr, i) => {
          const imgUrl = cr.images?.[0]?.url;
          const bg = imgUrl
            ? `url(${imgUrl}?w=640&h=800&fit=crop&fm=webp&q=85) center/cover no-repeat`
            : gradients[i % gradients.length];
          return (
            <Link href={`/creators?id=${cr.id}`} key={`${cr.id}-${i}`} className={s.crCard}>
              <div className={s.crImgWrap}>
                <div className={s.crImgBg} style={{ background: bg }} />
                <div className={s.crGrad} />
                <span className={s.crCatLabel}>{cr.catLabel}</span>
              </div>
              <div className={s.crRole}>{cr.role}</div>
              <div className={s.crName}>{cr.name}</div>
              <div className={s.crTags}>
                {cr.tags.map((t) => <span key={t} className={s.crTag}>{t}</span>)}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

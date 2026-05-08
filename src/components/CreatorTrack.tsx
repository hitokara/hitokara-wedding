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

    let raf = 0;
    let last = performance.now();
    let paused = false;
    let resumeTimer: number | null = null;
    const SPEED = 30; // px / second

    // Auto-scroll loop
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused && document.visibilityState === "visible") {
        wrap.scrollLeft += SPEED * dt;
        // Seamless wrap-around when reaching the duplicate boundary
        const half = wrap.scrollWidth / 2;
        if (wrap.scrollLeft >= half) {
          wrap.scrollLeft -= half;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Pause / resume helpers
    const pause = () => {
      paused = true;
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };
    const scheduleResume = (delay = 2500) => {
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        paused = false;
        resumeTimer = null;
        last = performance.now();
      }, delay);
    };

    // Desktop hover / mobile touch
    const onPointerEnter = () => pause();
    const onPointerLeave = () => scheduleResume(800);
    const onTouchStart = () => pause();
    const onTouchEnd = () => scheduleResume(2500);
    const onScroll = () => {
      // While the user is scrolling, keep paused; resume after no-scroll for 1.5s
      pause();
      scheduleResume(1500);
    };
    const onVisibilityChange = () => {
      last = performance.now();
    };

    wrap.addEventListener("mouseenter", onPointerEnter);
    wrap.addEventListener("mouseleave", onPointerLeave);
    wrap.addEventListener("touchstart", onTouchStart, { passive: true });
    wrap.addEventListener("touchend", onTouchEnd, { passive: true });
    wrap.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimer) window.clearTimeout(resumeTimer);
      wrap.removeEventListener("mouseenter", onPointerEnter);
      wrap.removeEventListener("mouseleave", onPointerLeave);
      wrap.removeEventListener("touchstart", onTouchStart);
      wrap.removeEventListener("touchend", onTouchEnd);
      wrap.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
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

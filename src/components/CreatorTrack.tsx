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

    const pause = () => {
      paused = true;
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };
    const scheduleResume = (delay: number) => {
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        paused = false;
        resumeTimer = null;
        last = performance.now();
      }, delay);
    };

    // Auto-scroll loop
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused && document.visibilityState === "visible") {
        // Seamless wrap-around: keep scroll within first half of the duplicated set
        const half = wrap.scrollWidth / 2;
        if (half > 0) {
          let next = wrap.scrollLeft + SPEED * dt;
          if (next >= half) next -= half;
          wrap.scrollLeft = next;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // User-initiated input: pause auto-scroll briefly so user can swipe/drag freely.
    // We listen to pointer + wheel events directly (NOT to `scroll` event, which would
    // also fire on programmatic scrollLeft changes and create a pause feedback loop).
    const onPointerDown = () => pause();
    const onPointerUp = () => scheduleResume(2500);
    const onMouseEnter = () => pause();
    const onMouseLeave = () => scheduleResume(800);
    const onWheel = () => {
      pause();
      scheduleResume(1500);
    };
    const onVisibilityChange = () => {
      last = performance.now();
    };

    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("pointerup", onPointerUp);
    wrap.addEventListener("pointercancel", onPointerUp);
    wrap.addEventListener("mouseenter", onMouseEnter);
    wrap.addEventListener("mouseleave", onMouseLeave);
    wrap.addEventListener("wheel", onWheel, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimer) window.clearTimeout(resumeTimer);
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointerup", onPointerUp);
      wrap.removeEventListener("pointercancel", onPointerUp);
      wrap.removeEventListener("mouseenter", onMouseEnter);
      wrap.removeEventListener("mouseleave", onMouseLeave);
      wrap.removeEventListener("wheel", onWheel);
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

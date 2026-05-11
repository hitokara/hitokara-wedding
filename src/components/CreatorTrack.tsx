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

    // Performance: only run autoscroll when the track is actually on screen.
    // Use setInterval at 30 Hz to keep TBT low (vs rAF which fires every frame).
    let intervalId: number | null = null;
    let paused = false;
    let userInteracting = false;
    let inView = false;
    let resumeTimer: number | null = null;
    let cachedHalf = 0;
    const STEP_MS = 33; // ~30fps cadence — smooth enough, low main-thread cost
    const SPEED_PX = 1; // px per tick → 30 px/sec

    // Cache scrollWidth (expensive to read each frame). Refresh on resize only.
    const refreshHalf = () => {
      cachedHalf = wrap.scrollWidth / 2;
    };

    const startLoop = () => {
      if (intervalId !== null) return;
      refreshHalf();
      intervalId = window.setInterval(() => {
        if (paused || userInteracting) return;
        if (document.visibilityState !== "visible") return;
        if (cachedHalf <= 0) return;
        const next = wrap.scrollLeft + SPEED_PX;
        if (next >= cachedHalf) {
          wrap.scrollLeft = next - cachedHalf;
        } else {
          wrap.scrollLeft = next;
        }
      }, STEP_MS);
    };

    const stopLoop = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Only run when track is in viewport — saves CPU when scrolled away
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) startLoop();
        else stopLoop();
      },
      { threshold: 0.01 }
    );
    io.observe(wrap);

    // Refresh cached width on resize
    const onResize = () => refreshHalf();
    window.addEventListener("resize", onResize, { passive: true });

    const startResumeTimer = (delay: number) => {
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        userInteracting = false;
        paused = false;
        resumeTimer = null;
      }, delay);
    };
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
      stopLoop();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      if (resumeTimer) window.clearTimeout(resumeTimer);
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointerup", onPointerUp);
      wrap.removeEventListener("pointercancel", onPointerUp);
      wrap.removeEventListener("mouseenter", onMouseEnter);
      wrap.removeEventListener("mouseleave", onMouseLeave);
      wrap.removeEventListener("wheel", onWheel);
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

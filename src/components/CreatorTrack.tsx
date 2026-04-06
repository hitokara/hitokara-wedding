"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

interface CreatorData {
  id: string;
  name: string;
  role: string;
  catLabel: string;
  tags: string[];
}

interface CreatorTrackProps {
  creators: CreatorData[];
  gradients: string[];
  styles: Record<string, string>;
}

export default function CreatorTrack({ creators, gradients, styles: s }: CreatorTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf: number;
    let paused = false;

    const step = () => {
      if (!paused && el.scrollLeft < el.scrollWidth - el.clientWidth) {
        el.scrollLeft += 0.5;
      } else if (!paused) {
        el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };

    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, []);

  return (
    <div className={s.crTrack} ref={trackRef}>
      {creators.map((cr, i) => (
        <Link href="/creators" key={cr.id} className={s.crCard}>
          <div className={s.crImgWrap}>
            <div className={s.crImgBg} style={{ background: gradients[i % gradients.length] }} />
            <div className={s.crGrad} />
            <span className={s.crCatLabel}>{cr.catLabel}</span>
          </div>
          <div className={s.crRole}>{cr.role}</div>
          <div className={s.crName}>{cr.name}</div>
          <div className={s.crTags}>
            {cr.tags.map((t) => <span key={t} className={s.crTag}>{t}</span>)}
          </div>
        </Link>
      ))}
    </div>
  );
}

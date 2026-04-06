"use client";

import Link from "next/link";
import styles from "./CreatorTrack.module.css";

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
  // Duplicate creators for seamless loop
  const doubled = [...creators, ...creators];

  return (
    <div className={styles.trackWrapper}>
      <div className={styles.trackInner}>
        {doubled.map((cr, i) => (
          <Link href="/creators" key={`${cr.id}-${i}`} className={s.crCard}>
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
    </div>
  );
}

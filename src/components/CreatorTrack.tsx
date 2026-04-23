"use client";

import Link from "next/link";
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

  return (
    <div className={styles.trackWrapper}>
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

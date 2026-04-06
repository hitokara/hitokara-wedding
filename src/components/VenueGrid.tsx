"use client";

import { useState } from "react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

interface Venue {
  name: string;
  area: string;
  bg: string;
  desc: string;
}

interface VenueGridProps {
  venues: Venue[];
  styles: Record<string, string>;
}

export default function VenueGrid({ venues, styles: s }: VenueGridProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className={s.vGrid}>
      {venues.map((v, i) => (
        <AnimateOnScroll key={v.name} animation="scaleIn" delay={80 + i * 80}>
          <div
            className={`${s.vCard} ${expanded === v.name ? s.vCardExpanded || "" : ""}`}
            onClick={() => setExpanded(expanded === v.name ? null : v.name)}
          >
            <div className={s.vImg}>
              <div className={s.vImgInner} style={{ background: v.bg }} />
            </div>
            <div className={s.vInfo}>
              <div className={s.vName}>{v.name}</div>
              <div className={s.vArea}>{v.area}</div>
              {expanded === v.name && (
                <div className={s.vDesc}>{v.desc}</div>
              )}
            </div>
          </div>
        </AnimateOnScroll>
      ))}
    </div>
  );
}

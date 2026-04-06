"use client";

import { useEffect, useRef, useState } from "react";

interface StatItem {
  num: string;
  suffix: string;
  desc: string;
}

const STATS: StatItem[] = [
  { num: "98", suffix: "%", desc: "カップルが「打ち合わせ前に<br/>担当者を知りたかった」と回答" },
  { num: "1.8", suffix: "\u00d7", desc: "初期見積もりから最終費用が<br/>平均1.8倍に膨らむことがある" },
  { num: "6", suffix: "h", desc: "打ち合わせから決断を<br/>迫られるまでの平均時間" },
];

function useCountUp(end: number, duration: number, trigger: boolean, isFloat: boolean) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * end;
      setVal(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setVal(end);
      }
    };

    requestAnimationFrame(tick);
  }, [trigger, end, duration]);

  return isFloat ? val.toFixed(1) : String(Math.round(val));
}

function StatCounter({ stat, visible }: { stat: StatItem; visible: boolean }) {
  const numericVal = parseFloat(stat.num);
  const isFloat = stat.num.includes(".");
  const display = useCountUp(numericVal, 1500, visible, isFloat);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0 24px", alignItems: "center", padding: "20px 0", borderBottom: "0.5px solid rgba(255,255,255,.08)" }}>
      <div style={{ fontFamily: "var(--num)", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(48px, 6vw, 72px)", color: "var(--sea)", lineHeight: 1, letterSpacing: "-.02em", minWidth: 140 }}>
        {display}{stat.suffix}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: stat.desc }} />
    </div>
  );
}

export default function ConceptStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", borderTop: "0.5px solid rgba(255,255,255,.12)" }}>
      {STATS.map((stat) => (
        <StatCounter key={stat.num} stat={stat} visible={visible} />
      ))}
    </div>
  );
}

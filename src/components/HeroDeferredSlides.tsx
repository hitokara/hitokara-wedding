"use client";

import { useEffect, useState } from "react";

interface Props {
  slides: string[];
  className: string;
}

/**
 * Renders decorative hero slides AFTER first paint to keep
 * the LCP image (slide 1) un-contended on the initial render.
 *
 * Each slide's <div> mounts on a delayed schedule (idle → tick),
 * so its background-image network request is deferred past LCP.
 * Visual cross-fade timing is preserved via animation-delay below.
 */
export default function HeroDeferredSlides({ slides, className }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    let idleId = 0;
    let timeoutId = 0;
    const fire = () => setMounted(true);

    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(fire, { timeout: 3000 });
    } else {
      timeoutId = window.setTimeout(fire, 2500);
    }
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      // requestIdleCallback cleanup intentionally omitted: setMounted is harmless
      void idleId;
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {slides.map((src, i) => (
        <div
          key={i + 1}
          className={className}
          style={{
            backgroundImage: `url(${src})`,
            animationDelay: `${(i + 1) * 3}s`,
          }}
        />
      ))}
    </>
  );
}

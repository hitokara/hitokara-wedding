"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/gtag";

/**
 * Auto-tracks global analytics events:
 *  - scroll depth (25/50/75/100%)
 *  - outbound link clicks
 *  - LINE CTA clicks (lin.ee / line.me domains)
 *
 * Mount once in the root layout.
 */
export default function AnalyticsEnhancer() {
  useEffect(() => {
    // Scroll depth tracking (fire once per threshold per page view)
    const fired = new Set<number>();
    const thresholds = [25, 50, 75, 100];

    const onScroll = () => {
      const h = document.documentElement;
      const scrollTop = window.scrollY || h.scrollTop || 0;
      const viewport = window.innerHeight || h.clientHeight || 0;
      const full = Math.max(
        h.scrollHeight,
        document.body?.scrollHeight ?? 0
      );
      const denom = Math.max(full - viewport, 1);
      const pct = Math.min(100, Math.round((scrollTop / denom) * 100));
      for (const t of thresholds) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          trackEvent("scroll_depth", { percent: t, path: location.pathname });
        }
      }
    };

    let ticking = false;
    const handler = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    onScroll(); // initial check (short pages)

    // Outbound link + LINE / Instagram click tracking
    const clickHandler = (ev: Event) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const a = target.closest("a") as HTMLAnchorElement | null;
      if (!a || !a.href) return;

      let host = "";
      try {
        host = new URL(a.href, location.origin).host;
      } catch {
        return;
      }

      const isInternal =
        host === location.host || host === "" || host.endsWith(".hitokarawedding.com");

      // LINE CTAs
      if (host === "lin.ee" || host.endsWith("line.me")) {
        trackEvent("line_click", { href: a.href, path: location.pathname });
        return;
      }

      // Instagram
      if (host.includes("instagram.com")) {
        trackEvent("instagram_click", { href: a.href, path: location.pathname });
        return;
      }

      // Generic outbound
      if (!isInternal) {
        trackEvent("outbound_click", { host, href: a.href, path: location.pathname });
      }
    };
    document.addEventListener("click", clickHandler, { capture: true });

    return () => {
      window.removeEventListener("scroll", handler);
      document.removeEventListener("click", clickHandler, { capture: true });
    };
  }, []);

  return null;
}

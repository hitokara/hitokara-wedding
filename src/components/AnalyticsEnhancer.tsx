"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent, trackPageview } from "@/lib/gtag";

/**
 * Auto-tracks global analytics events:
 *  - SPA page_view on route changes (App Router)
 *  - scroll depth (25/50/75/100%) — via IntersectionObserver markers (no layout reads)
 *  - outbound link clicks (LINE / Instagram / Calendar / generic)
 *
 * Mount once in the root layout.
 */
export default function AnalyticsEnhancer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstLoadRef = useRef(true);

  // SPA page_view tracking
  useEffect(() => {
    if (firstLoadRef.current) {
      // First load — already tracked by send_page_view in gtag config
      firstLoadRef.current = false;
      return;
    }
    const query = searchParams?.toString();
    const full = query ? `${pathname}?${query}` : pathname;
    trackPageview(full);
  }, [pathname, searchParams]);

  // Scroll depth tracking using sentinel <div>s + IntersectionObserver.
  // No scroll listener → zero layout-read overhead.
  useEffect(() => {
    const thresholds = [25, 50, 75, 100];
    const sentinels: HTMLDivElement[] = [];

    // Defer setup to idle time so it doesn't compete with critical paint
    const setup = () => {
      thresholds.forEach((pct) => {
        const el = document.createElement("div");
        el.setAttribute("aria-hidden", "true");
        el.style.cssText =
          `position:absolute;left:0;width:1px;height:1px;pointer-events:none;opacity:0;top:${pct}%;`;
        // Insert into body but position relative to document scroll
        document.body.appendChild(el);
        sentinels.push(el);
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const idx = sentinels.indexOf(entry.target as HTMLDivElement);
            if (idx === -1) return;
            const pct = thresholds[idx];
            trackEvent("scroll_depth", { percent: pct, path: location.pathname });
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px" }
      );
      sentinels.forEach((s) => observer.observe(s));
    };

    let idleId = 0;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(setup);
    } else {
      idleId = window.setTimeout(setup, 1500);
    }

    // Outbound link / CTA click tracking (passive)
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

      if (host === "lin.ee" || host.endsWith("line.me")) {
        trackEvent("line_click", { href: a.href, path: location.pathname });
        return;
      }
      if (host.includes("instagram.com")) {
        trackEvent("instagram_click", { href: a.href, path: location.pathname });
        return;
      }
      if (host.includes("calendar.google.com") || host.includes("calendar.app.google")) {
        trackEvent("booking_click", { href: a.href, path: location.pathname });
        return;
      }
      if (!isInternal) {
        trackEvent("outbound_click", { host, href: a.href, path: location.pathname });
      }
    };
    document.addEventListener("click", clickHandler, { capture: true });

    return () => {
      if (typeof w.cancelIdleCallback === "function" && idleId) {
        w.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
      sentinels.forEach((s) => s.remove());
      document.removeEventListener("click", clickHandler, { capture: true });
    };
  }, [pathname]);

  return null;
}

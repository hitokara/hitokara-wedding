/**
 * Google Analytics 4 helpers.
 *
 * - `GA_ID` is taken from `NEXT_PUBLIC_GA_ID` (fallback to the hard-coded id for
 *   backwards compatibility).
 * - `trackEvent` for custom events.
 * - `trackPageview` for SPA route changes (App Router does not emit it for
 *   client-side navigation by default).
 * - `setUserProperty` for custom user properties.
 * - `grantConsent` / `denyConsent` for Consent Mode v2.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-QPV9CZRY9H";

type GtagParams = Record<string, string | number | boolean | undefined | null>;

/** Fire a custom event. Safe to call on server (noop). */
export function trackEvent(action: string, params?: GtagParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", action, params ?? {});
}

/** Fire a synthetic page_view event — needed for App Router client navigation. */
export function trackPageview(path: string, title?: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: title ?? document.title,
    send_to: GA_ID,
  });
}

/** Assign a user property (e.g. funnel stage, favorites count, audience tag). */
export function setUserProperty(key: string, value: string | number | boolean): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("set", "user_properties", { [key]: value });
}

/** Consent Mode v2: user accepted analytics/ads tracking. */
export function grantConsent(): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("consent", "update", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted",
    functionality_storage: "granted",
    personalization_storage: "granted",
    security_storage: "granted",
  });
  try {
    localStorage.setItem("hitokara-consent", "granted");
  } catch { /* ignore */ }
}

/** Consent Mode v2: user declined. */
export function denyConsent(): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  try {
    localStorage.setItem("hitokara-consent", "denied");
  } catch { /* ignore */ }
}

// Extend Window for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

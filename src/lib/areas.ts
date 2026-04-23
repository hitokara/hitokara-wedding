/**
 * Central service-area configuration.
 *
 * This file is the single source of truth for the geographic areas the business
 * serves. All metadata (SEO/JSON-LD), page copy, and LLMO content should source
 * from here so that expanding to new areas requires only updating this file.
 *
 * Phase 0 (current): 横浜・鎌倉 main, 東京 emerging, 関東 reach.
 */

export const SITE_URL = "https://hitokarawedding.com";

/* --------------------------------------------------------------------------
 * Area tiers
 * ------------------------------------------------------------------------- */

/** Primary cities we have deep creator coverage for. Used in hero copy. */
export const MAIN_AREAS = ["横浜", "鎌倉"] as const;

/** Cities actively served. Used in JSON-LD `areaServed` and descriptions. */
export const SERVED_CITIES: ReadonlyArray<{
  name: string;
  en: string;
  region: "神奈川県" | "東京都";
  addressCountry: "JP";
}> = [
  { name: "横浜市", en: "Yokohama", region: "神奈川県", addressCountry: "JP" },
  { name: "鎌倉市", en: "Kamakura", region: "神奈川県", addressCountry: "JP" },
  { name: "逗子市", en: "Zushi", region: "神奈川県", addressCountry: "JP" },
  { name: "葉山町", en: "Hayama", region: "神奈川県", addressCountry: "JP" },
  { name: "東京都", en: "Tokyo", region: "東京都", addressCountry: "JP" },
];

/** Broader reach — what we can cover on request. Used in descriptions. */
export const REACH_REGIONS = ["関東"] as const;

/* --------------------------------------------------------------------------
 * Human-readable labels
 * ------------------------------------------------------------------------- */

/** Short label used in page titles and catchphrases (current marketing focus) */
export const AREA_LABEL_SHORT = "横浜・鎌倉・東京";

/** Fuller label emphasising regional coverage (used in descriptions) */
export const AREA_LABEL_FULL = "横浜・鎌倉・東京を中心に関東エリア";

/** Compact label for ribbons and minor copy */
export const AREA_LABEL_MINI = "横浜・鎌倉・東京";

/** English eyebrow on hero (all caps for UI) */
export const AREA_EN_EYEBROW = "YOKOHAMA / KAMAKURA / TOKYO";

/* --------------------------------------------------------------------------
 * Structured data helpers
 * ------------------------------------------------------------------------- */

/** Schema.org City entries for areaServed */
export function schemaAreaServed() {
  return SERVED_CITIES.map((c) => ({
    "@type": "City" as const,
    name: c.name,
    addressCountry: c.addressCountry,
  }));
}

/** Regions (for broader reach) */
export function schemaAreaServedExtended() {
  return [
    ...schemaAreaServed(),
    { "@type": "AdministrativeArea" as const, name: "関東", addressCountry: "JP" as const },
  ];
}

/* --------------------------------------------------------------------------
 * SEO keyword kit
 * ------------------------------------------------------------------------- */

/** Base keyword set — used site-wide */
export const SEO_KEYWORDS: string[] = [
  // 地域 + 結婚式
  "横浜 結婚式",
  "鎌倉 結婚式",
  "東京 結婚式",
  "関東 結婚式",
  "神奈川 結婚式",
  // Tokyo sub-areas (ロングテール)
  "表参道 結婚式",
  "青山 結婚式",
  "代官山 結婚式",
  "代々木 結婚式",
  // Kamakura 神社
  "鶴岡八幡宮 結婚式",
  "鎌倉宮 結婚式",
  // サービス特性
  "結婚式 適正価格",
  "持ち込み自由 結婚式",
  "クリエイター 結婚式",
  "ふたりらしい結婚式",
  "ウェディングプロデュース",
  "フリーランス ウェディングプランナー",
  "フリーランス カメラマン 結婚式",
  "ブライダル 見積もり シミュレーション",
  "結婚式 費用 相場",
  // プランナー関連
  "ウェディングプランナー 横浜",
  "ウェディングプランナー 東京",
  "ウェディングプランナー 関東",
];

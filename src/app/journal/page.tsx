import { ARTICLES } from "@/lib/articles";
import { getArticles, mapCMSArticle } from "@/lib/microcms";
import { AREA_LABEL_SHORT, AREA_LABEL_FULL, SITE_URL } from "@/lib/areas";
import JournalClient from "@/components/JournalClient";
import s from "./page.module.css";

import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `ジャーナル - 結婚式準備のヒントと${AREA_LABEL_SHORT}の会場情報`,
  description:
    `${AREA_LABEL_FULL}の結婚式に関するジャーナル。会場レポート、クリエイター紹介、費用・見積もりのノウハウ、持ち込み自由のウェディングスタイルなど、ふたりらしい結婚式づくりのヒントをお届けします。`,
  alternates: {
    canonical: `${SITE_URL}/journal`,
  },
};

/** Display order for sidebar categories. Counts are computed from actual articles. */
const SIDE_CAT_NAMES = [
  "エリア情報",
  "クリエイター紹介",
  "ノウハウ",
  "費用・見積もり",
  "実例レポート",
  "和婚",
  "会場レポ",
  "お知らせ",
];

export default async function JournalPage() {
  const cmsResult = await getArticles({ limit: 100 });
  const articles =
    cmsResult.contents.length > 0
      ? cmsResult.contents.map((a, i) => mapCMSArticle(a, i))
      : ARTICLES;

  // Build sideCats with real article counts
  const counts = new Map<string, number>();
  for (const a of articles) {
    counts.set(a.cat, (counts.get(a.cat) ?? 0) + 1);
  }
  // Predefined order first; then any other category that exists with articles
  const orderedNames = [
    ...SIDE_CAT_NAMES.filter((n) => counts.has(n)),
    ...Array.from(counts.keys()).filter((n) => !SIDE_CAT_NAMES.includes(n)),
  ];
  const sideCats = orderedNames.map((name) => ({
    name,
    count: counts.get(name) ?? 0,
  }));

  return <JournalClient articles={articles} sideCats={sideCats} styles={s} />;
}

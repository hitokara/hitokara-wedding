import { ARTICLES } from "@/lib/articles";
import { getArticles, mapCMSArticle } from "@/lib/microcms";
import JournalClient from "@/components/JournalClient";
import s from "./page.module.css";

import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ジャーナル - 結婚式準備のヒントと横浜・鎌倉の会場情報",
  description:
    "横浜・鎌倉エリアの結婚式に関するジャーナル。会場レポート、クリエイター紹介、費用・見積もりのノウハウ、持ち込み自由のウェディングスタイルなど、ふたりらしい結婚式づくりのヒントをお届けします。",
  alternates: {
    canonical: "https://hitokara-wedding.com/journal",
  },
};

const SIDE_CATS = [
  { name: "エリア情報", count: 8 },
  { name: "クリエイター紹介", count: 12 },
  { name: "ノウハウ", count: 7 },
  { name: "費用・見積もり", count: 5 },
  { name: "実例レポート", count: 4 },
  { name: "和婚", count: 6 },
];

export default async function JournalPage() {
  const cmsResult = await getArticles({ limit: 20 });
  const articles =
    cmsResult.contents.length > 0
      ? cmsResult.contents.map((a, i) => mapCMSArticle(a, i))
      : ARTICLES;

  return <JournalClient articles={articles} sideCats={SIDE_CATS} styles={s} />;
}

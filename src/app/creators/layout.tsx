import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "クリエイター一覧 - カメラマン・プランナー・ヘアメイクを自分で選ぶ",
  description:
    "横浜・鎌倉エリアで活躍するウェディングクリエイターの一覧。フリーランスのカメラマン・ウェディングプランナー・ヘアメイク・映像・フラワーデザイナーの顔写真・作品・料金を公開。気になるクリエイターを指名して、ふたりらしい結婚式をつくれます。",
  alternates: {
    canonical: "https://hitokarawedding.com/creators",
  },
};

export default function CreatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

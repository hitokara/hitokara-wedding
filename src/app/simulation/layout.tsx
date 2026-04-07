import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "見積もりシミュレーター - 結婚式費用をリアルタイムで試算",
  description:
    "横浜・鎌倉の結婚式費用をリアルタイムで試算できるブライダル見積もりシミュレーター。ゲスト人数・会場・プランナー・カメラマンなどを選ぶだけで概算合計を表示。持ち込み自由・追加費用なしの適正価格がわかります。結婚式の費用相場が気になる方もぜひお試しください。",
  alternates: {
    canonical: "https://hitokarawedding.com/simulation",
  },
};

export default function SimulationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

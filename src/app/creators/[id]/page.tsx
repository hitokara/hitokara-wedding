import type { Metadata } from "next";
import { CREATORS_LIST } from "@/lib/creators";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const creator = CREATORS_LIST.find((c) => c.id === id);
  const name = creator?.name ?? id;
  const role = creator?.role ?? "クリエイター";
  return {
    title: `${name}（${role}） - 横浜・鎌倉のウェディングクリエイター`,
    description: creator
      ? `${name}は横浜・鎌倉エリアで活躍する${creator.catLabel}。${creator.profile} ヒトカラウェディングで指名して、ふたりらしい結婚式を。`
      : `横浜・鎌倉のウェディングクリエイター詳細ページ。ヒトカラウェディングでは、すべてのクリエイターの顔・実績・料金を公開しています。`,
    alternates: {
      canonical: `https://hitokara-wedding.com/creators/${id}`,
    },
  };
}

export default async function CreatorDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="container section">
      <h1 className="mincho" style={{ fontSize: 28 }}>
        CREATOR: {id}
      </h1>
      <p style={{ marginTop: 16, color: "var(--t2)" }}>
        クリエイター詳細ページです。
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CREATORS_LIST } from "@/lib/creators";
import { getCreatorById, mapCMSCreator } from "@/lib/microcms";

export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
};

async function resolveCreator(id: string) {
  const cms = await getCreatorById(id);
  if (cms) return mapCMSCreator(cms);
  return CREATORS_LIST.find((c) => c.id === id) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const creator = await resolveCreator(id);
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
  const creator = await resolveCreator(id);

  if (!creator) {
    return (
      <div className="container section">
        <h1 className="mincho" style={{ fontSize: 28 }}>
          クリエイターが見つかりません
        </h1>
        <p style={{ marginTop: 16, color: "var(--t2)" }}>
          指定されたクリエイターは存在しないか、削除された可能性があります。
        </p>
        <Link href="/creators" style={{ marginTop: 24, display: "inline-block", color: "var(--sea)" }}>
          &larr; クリエイター一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <nav style={{ fontSize: 13, color: "var(--t3)", marginBottom: 24 }}>
        <Link href="/" style={{ color: "var(--t3)" }}>TOP</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <Link href="/creators" style={{ color: "var(--t3)" }}>Creators</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <span>{creator.name}</span>
      </nav>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        <div style={{
          width: 280,
          height: 320,
          borderRadius: 16,
          background: "linear-gradient(155deg,#8ab8d0,#4a7898)",
          flexShrink: 0,
        }} />
        <div style={{ flex: 1, minWidth: 280 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            background: "var(--sea)",
            color: "#fff",
            padding: "3px 10px",
            borderRadius: 40,
          }}>
            {creator.catLabel}
          </span>
          <h1 className="mincho" style={{ fontSize: 28, marginTop: 12 }}>
            {creator.name}
          </h1>
          <div style={{ fontSize: 13, color: "var(--t3)", marginTop: 4 }}>{creator.role}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {creator.tags.map((t) => (
              <span key={t} style={{
                fontSize: 12,
                background: "var(--sand)",
                padding: "3px 10px",
                borderRadius: 40,
              }}>
                {t}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 20, fontSize: 14, color: "var(--t2)" }}>
            <span style={{ fontWeight: 600 }}>参考価格</span>
            <span style={{ fontSize: 22, fontWeight: 700, marginLeft: 8 }}>
              &yen;{creator.price.toLocaleString()}
            </span>
            <span style={{ fontSize: 13, color: "var(--t3)" }}>〜</span>
          </div>
          <p style={{ marginTop: 20, lineHeight: 1.9, color: "var(--t2)" }}>
            {creator.profile}
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <a
              href="https://lin.ee/tRn0iPk"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#06C755",
                color: "#fff",
                padding: "12px 28px",
                borderRadius: 40,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              この人に相談する
            </a>
            <Link
              href="/simulation"
              style={{
                border: "1px solid var(--line)",
                padding: "12px 28px",
                borderRadius: 40,
                fontWeight: 600,
                fontSize: 14,
                color: "var(--t1)",
                textDecoration: "none",
              }}
            >
              シミュレーターで見積もり
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

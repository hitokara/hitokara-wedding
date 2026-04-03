import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `クリエイター ${id} | ヒトカラウェディング`,
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

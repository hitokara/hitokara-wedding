import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} | JOURNAL | ヒトカラウェディング`,
  };
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="container section">
      <h1 className="mincho" style={{ fontSize: 28 }}>
        JOURNAL: {slug}
      </h1>
      <p style={{ marginTop: 16, color: "var(--t2)" }}>
        ジャーナル記事ページです。
      </p>
    </div>
  );
}

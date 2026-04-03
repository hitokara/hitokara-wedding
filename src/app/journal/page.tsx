import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JOURNAL | ヒトカラウェディング",
};

export default function JournalPage() {
  return (
    <div className="container section">
      <h1 className="mincho" style={{ fontSize: 28 }}>
        JOURNAL
      </h1>
      <p style={{ marginTop: 16, color: "var(--t2)" }}>
        ジャーナル一覧ページです。
      </p>
    </div>
  );
}

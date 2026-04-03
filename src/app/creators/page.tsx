import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CREATORS | ヒトカラウェディング",
};

export default function CreatorsPage() {
  return (
    <div className="container section">
      <h1 className="mincho" style={{ fontSize: 28 }}>
        CREATORS
      </h1>
      <p style={{ marginTop: 16, color: "var(--t2)" }}>
        クリエイター一覧ページです。
      </p>
    </div>
  );
}

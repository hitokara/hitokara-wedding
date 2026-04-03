import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CONCEPT | ヒトカラウェディング",
};

export default function ConceptPage() {
  return (
    <div className="container section">
      <h1 className="mincho" style={{ fontSize: 28 }}>
        CONCEPT
      </h1>
      <p style={{ marginTop: 16, color: "var(--t2)" }}>
        ヒトカラウェディングのコンセプトページです。
      </p>
    </div>
  );
}

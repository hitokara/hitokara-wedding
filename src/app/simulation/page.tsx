import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIMULATION | ヒトカラウェディング",
};

export default function SimulationPage() {
  return (
    <div className="container section">
      <h1 className="mincho" style={{ fontSize: 28 }}>
        SIMULATION
      </h1>
      <p style={{ marginTop: 16, color: "var(--t2)" }}>
        見積もりシミュレーションページです。
      </p>
    </div>
  );
}

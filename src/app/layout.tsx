import type { Metadata } from "next";
import { Shippori_Mincho, Cormorant_Garamond, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const shipporiMincho = Shippori_Mincho({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mincho",
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-num",
});

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-gothic",
});

export const metadata: Metadata = {
  title: "ヒトカラウェディング | 人から選ぶ、ふたりらしい結婚式",
  description:
    "ヒトカラウェディングは、プランナーやクリエイターなど「人」から選ぶ新しい結婚式のかたち。ふたりらしいウェディングを、信頼できるプロフェッショナルと一緒につくりましょう。",
  openGraph: {
    title: "ヒトカラウェディング | 人から選ぶ、ふたりらしい結婚式",
    description:
      "プランナーやクリエイターなど「人」から選ぶ新しい結婚式のかたち。",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${shipporiMincho.variable} ${cormorantGaramond.variable} ${zenKakuGothicNew.variable}`}
    >
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

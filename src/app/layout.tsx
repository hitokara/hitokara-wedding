import type { Metadata, Viewport } from "next";
import { Shippori_Mincho, Cormorant_Garamond, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SITE_URL = "https://hitokara-wedding.com";

const shipporiMincho = Shippori_Mincho({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mincho",
  preload: false,
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
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a3a4a",
};

export const metadata: Metadata = {
  title: {
    template: "%s | ヒトカラウェディング - 横浜・鎌倉のウェディングプロデュース",
    default: "ヒトカラウェディング | 人から選ぶ、ふたりらしい結婚式 - 横浜・鎌倉",
  },
  description:
    "ヒトカラウェディングは横浜・鎌倉エリアを中心に、クリエイターを自分で選べるウェディングプロデュースブランドです。持ち込み自由・適正価格・透明な見積もりで、ふたりらしい結婚式を実現。鶴岡八幡宮・鎌倉宮での神前式にも対応。フリーランスのカメラマン・プランナー・ヘアメイクを顔と実績で指名できます。",
  keywords: [
    "横浜 結婚式",
    "鎌倉 結婚式",
    "結婚式 適正価格",
    "持ち込み自由 結婚式",
    "クリエイター 結婚式",
    "ウェディングプランナー 横浜",
    "鶴岡八幡宮 結婚式",
    "鎌倉宮 結婚式",
    "ふたりらしい結婚式",
    "ウェディングプロデュース",
    "フリーランス カメラマン 結婚式",
    "ブライダル 見積もり シミュレーション",
    "結婚式 費用 相場",
  ],
  openGraph: {
    title: "ヒトカラウェディング | 人から選ぶ、ふたりらしい結婚式 - 横浜・鎌倉",
    description:
      "横浜・鎌倉で、クリエイターを自分で選べるウェディングプロデュース。持ち込み自由・適正価格・透明な見積もりで、ふたりらしい結婚式を。",
    locale: "ja_JP",
    type: "website",
    siteName: "ヒトカラウェディング",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "ヒトカラウェディング | 人から選ぶ、ふたりらしい結婚式",
    description:
      "横浜・鎌倉で、クリエイターを自分で選べるウェディングプロデュース。持ち込み自由・適正価格。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

/* JSON-LD Structured Data */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ヒトカラウェディング",
  alternateName: "HITOKARA WEDDING",
  url: SITE_URL,
  description:
    "横浜・鎌倉エリアを中心に、クリエイターを自分で選べるウェディングプロデュースブランド。持ち込み自由・適正価格・透明な見積もり。",
  areaServed: [
    { "@type": "City", name: "横浜市", addressCountry: "JP" },
    { "@type": "City", name: "鎌倉市", addressCountry: "JP" },
    { "@type": "City", name: "逗子市", addressCountry: "JP" },
    { "@type": "City", name: "葉山町", addressCountry: "JP" },
  ],
  sameAs: ["https://lin.ee/tRn0iPk"],
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "WeddingService" as const,
  name: "ヒトカラウェディング",
  description:
    "横浜・鎌倉エリアのウェディングプロデュース。プランナー・カメラマン・ヘアメイクなどクリエイターを自分で選び、持ち込み自由・適正価格で結婚式を実現。鶴岡八幡宮・鎌倉宮での神前式にも対応。",
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    addressRegion: "神奈川県",
    addressLocality: "横浜市",
    addressCountry: "JP",
  },
  areaServed: [
    { "@type": "City", name: "横浜市" },
    { "@type": "City", name: "鎌倉市" },
  ],
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "10:00",
    closes: "20:00",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ヒトカラウェディング",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/creators?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

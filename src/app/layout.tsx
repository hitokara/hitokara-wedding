import type { Metadata, Viewport } from "next";
import { Shippori_Mincho, Cormorant_Garamond, Zen_Kaku_Gothic_New } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnalyticsEnhancer from "@/components/AnalyticsEnhancer";
import { GA_ID } from "@/lib/gtag";
import {
  SITE_URL,
  AREA_LABEL_SHORT,
  AREA_LABEL_FULL,
  SEO_KEYWORDS,
  schemaAreaServedExtended,
} from "@/lib/areas";

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
    template: `%s | ヒトカラウェディング - ${AREA_LABEL_SHORT}のウェディングプロデュース`,
    default: `ヒトカラウェディング | 人から選ぶ、ふたりらしい結婚式 - ${AREA_LABEL_SHORT}`,
  },
  description:
    `ヒトカラウェディングは${AREA_LABEL_FULL}でクリエイターを自分で選べるウェディングプロデュースブランドです。持ち込み自由・適正価格・透明な見積もりで、ふたりらしい結婚式を実現。鶴岡八幡宮・鎌倉宮での神前式にも対応。フリーランスのカメラマン・プランナー・ヘアメイクを顔と実績で指名できます。`,
  keywords: SEO_KEYWORDS,
  openGraph: {
    title: `ヒトカラウェディング | 人から選ぶ、ふたりらしい結婚式 - ${AREA_LABEL_SHORT}`,
    description:
      `${AREA_LABEL_FULL}で、クリエイターを自分で選べるウェディングプロデュース。持ち込み自由・適正価格・透明な見積もりで、ふたりらしい結婚式を。`,
    locale: "ja_JP",
    type: "website",
    siteName: "ヒトカラウェディング",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: `ヒトカラウェディング - ${AREA_LABEL_SHORT}のウェディングプロデュース`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ヒトカラウェディング | 人から選ぶ、ふたりらしい結婚式",
    description:
      `${AREA_LABEL_SHORT}で、クリエイターを自分で選べるウェディングプロデュース。持ち込み自由・適正価格。`,
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        alt: "ヒトカラウェディング",
      },
    ],
  },
  other: {
    "format-detection": "telephone=no",
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
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

/* JSON-LD Structured Data */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}#org`,
  name: "ヒトカラウェディング",
  alternateName: ["HITOKARA WEDDING", "ヒトカラ", "hitokara wedding"],
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/og-default.jpg`,
  description:
    `${AREA_LABEL_FULL}で、クリエイターを自分で選べるウェディングプロデュースブランド。持ち込み自由・適正価格・透明な見積もり。`,
  foundingDate: "2024",
  areaServed: schemaAreaServedExtended(),
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: "https://lin.ee/tRn0iPk",
      availableLanguage: ["Japanese", "ja"],
      areaServed: "JP",
    },
  ],
  sameAs: [
    "https://lin.ee/tRn0iPk",
    "https://www.instagram.com/hitokara_wedding",
  ],
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "WeddingService" as const,
  "@id": `${SITE_URL}#business`,
  name: "ヒトカラウェディング",
  description:
    `${AREA_LABEL_FULL}のウェディングプロデュース。プランナー・カメラマン・ヘアメイクなどクリエイターを自分で選び、持ち込み自由・適正価格で結婚式を実現。鶴岡八幡宮・鎌倉宮での神前式にも対応。`,
  url: SITE_URL,
  image: `${SITE_URL}/og-default.jpg`,
  parentOrganization: { "@id": `${SITE_URL}#org` },
  address: {
    "@type": "PostalAddress",
    addressRegion: "神奈川県",
    addressLocality: "横浜市",
    addressCountry: "JP",
  },
  areaServed: schemaAreaServedExtended(),
  priceRange: "¥¥",
  knowsAbout: [
    "結婚式", "ウェディング", "ウェディングプロデュース", "神前式",
    "持ち込み自由", "適正価格ウェディング", "フリーランスクリエイター",
    "鶴岡八幡宮", "鎌倉宮",
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "10:00",
    closes: "20:00",
  },
  makesOffer: {
    "@type": "Offer",
    name: "ウェディングプロデュース",
    priceCurrency: "JPY",
    description: "クリエイター指名制・持ち込み自由のウェディングプロデュース",
    url: `${SITE_URL}/simulation`,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  name: "ヒトカラウェディング",
  alternateName: "HITOKARA WEDDING",
  url: SITE_URL,
  inLanguage: "ja-JP",
  publisher: { "@id": `${SITE_URL}#org` },
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
        {/* Google AdSense account (verification + default load hint) */}
        <meta name="google-adsense-account" content="ca-pub-2674981129220291" />
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
        {/* Google Analytics 4 — with Consent Mode v2 defaults */}
        <Script
          id="ga4-consent"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'granted',
                functionality_storage: 'granted',
                personalization_storage: 'granted',
                security_storage: 'granted',
                wait_for_update: 500
              });
              gtag('js', new Date());
            `,
          }}
        />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              gtag('config', '${GA_ID}', {
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure',
                allow_google_signals: true,
                allow_ad_personalization_signals: false,
                send_page_view: true
              });
            `,
          }}
        />
        <Suspense fallback={null}>
          <AnalyticsEnhancer />
        </Suspense>

        {/* Google AdSense */}
        <Script
          id="adsbygoogle-init"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2674981129220291"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

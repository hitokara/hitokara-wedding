import type { Metadata } from "next";
import Link from "next/link";
import { CREATORS_LIST } from "@/lib/creators";
import type { Creator } from "@/lib/creators";
import { getCreatorById, mapCMSCreator } from "@/lib/microcms";
import { SITE_URL, AREA_LABEL_SHORT, AREA_LABEL_FULL } from "@/lib/areas";

export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
};

async function resolveCreator(id: string) {
  const cms = await getCreatorById(id);
  if (cms) return mapCMSCreator(cms);
  return CREATORS_LIST.find((c) => c.id === id) ?? null;
}

function stripHtml(s?: string): string {
  if (!s) return "";
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const creator = await resolveCreator(id);
  if (!creator) {
    return {
      title: "クリエイターが見つかりません",
      robots: { index: false, follow: false },
    };
  }

  const name = creator.name;
  const role = creator.role || "クリエイター";
  const title = `${name}（${role}） - ${AREA_LABEL_SHORT}のウェディングクリエイター`;
  const profile = stripHtml(creator.profile).slice(0, 120);
  const description =
    `${name}は${AREA_LABEL_FULL}で活動する${creator.catLabel}${creator.role ? `・${creator.role}` : ""}。` +
    (profile ? `${profile}` : "") +
    ` ヒトカラウェディングで顔と実績を確認して指名できます。`;

  const ogImg = creator.images?.[0]?.url;
  const url = `${SITE_URL}/creators/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      siteName: "ヒトカラウェディング",
      locale: "ja_JP",
      ...(ogImg
        ? {
            images: [
              {
                url: `${ogImg}?w=1200&h=630&fit=crop`,
                width: 1200,
                height: 630,
                alt: `${name} - ${role}`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImg ? { images: [`${ogImg}?w=1200&h=630&fit=crop`] } : {}),
    },
  };
}

function buildCreatorJsonLd(creator: Creator, id: string) {
  const url = `${SITE_URL}/creators/${id}`;
  const images = [
    ...(creator.images?.map((i) => i.url) ?? []),
    ...(creator.works?.map((i) => i.url) ?? []),
  ];

  // Person schema (主役)
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name: creator.name,
    jobTitle: creator.role || creator.catLabel,
    description: stripHtml(creator.profile),
    url,
    ...(images.length > 0 ? { image: images } : {}),
    ...(creator.snsInstagram ? { sameAs: [creator.snsInstagram] } : {}),
    worksFor: {
      "@type": "Organization",
      "@id": `${SITE_URL}#org`,
      name: "ヒトカラウェディング",
    },
    knowsAbout: [creator.catLabel, "ウェディング", "結婚式", ...(creator.tags ?? [])].filter(Boolean),
  };

  // Service/offer (料金含む)
  const service = creator.price > 0 && {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: `${creator.name}の${creator.catLabel}サービス`,
    provider: { "@id": `${url}#person` },
    serviceType: creator.catLabel,
    areaServed: [
      { "@type": "City", name: "横浜市" },
      { "@type": "City", name: "鎌倉市" },
      { "@type": "City", name: "東京都" },
    ],
    offers: {
      "@type": "Offer",
      price: creator.price,
      priceCurrency: "JPY",
      availability: "https://schema.org/InStock",
      url,
    },
  };

  // Breadcrumb
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "クリエイター", item: `${SITE_URL}/creators` },
      { "@type": "ListItem", position: 3, name: creator.name, item: url },
    ],
  };

  return [person, service, breadcrumb].filter(Boolean);
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

  const jsonLd = buildCreatorJsonLd(creator, id);

  return (
    <>
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      <div className="container section">
        <nav style={{ fontSize: 13, color: "var(--t3)", marginBottom: 24 }} aria-label="パンくずリスト">
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
            background: creator.images?.[0]?.url
              ? `url(${creator.images[0].url}?w=800&h=900&fit=crop&fm=webp&q=85) center/cover no-repeat`
              : "linear-gradient(155deg,#8ab8d0,#4a7898)",
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
    </>
  );
}

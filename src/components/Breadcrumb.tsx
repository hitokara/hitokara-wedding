import Link from "next/link";
import s from "./Breadcrumb.module.css";

const SITE_URL = "https://hitokarawedding.com";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const all = [{ label: "TOP", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <div className={s.wrap}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className={s.breadcrumb} aria-label="パンくずリスト">
        {all.map((item, i) => (
          <span key={i}>
            {i > 0 && <span className={s.sep}>/</span>}
            {item.href ? (
              <Link href={item.href} className={s.link}>{item.label}</Link>
            ) : (
              <span className={s.current}>{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}

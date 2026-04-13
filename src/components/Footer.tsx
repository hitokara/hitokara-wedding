import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

const FOOTER_NAV = [
  { href: "/", label: "TOP" },
  { href: "/concept", label: "CONCEPT" },
  { href: "/creators", label: "CREATORS" },
  { href: "/simulation", label: "SIMULATION" },
  { href: "/journal", label: "JOURNAL" },
] as const;

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.logo}>
            <Link href="/">
              <Image
                src="/logo-header.jpg"
                alt="ヒトカラウェディング"
                width={180}
                height={36}
                style={{ height: '30px', width: 'auto' }}
              />
            </Link>
          </div>
          <nav className={styles.nav}>
            {FOOTER_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={styles.navLink}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className={styles.social}>
          <a
            href="https://www.instagram.com/hitokara_wedding/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label="Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            <span>@hitokara_wedding</span>
          </a>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} HITOKARA WEDDING Inc. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

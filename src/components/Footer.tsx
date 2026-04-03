import Link from "next/link";
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
            <Link href="/">ヒトカラウェディング</Link>
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

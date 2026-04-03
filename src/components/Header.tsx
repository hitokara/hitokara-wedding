"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { href: "/", label: "TOP" },
  { href: "/concept", label: "CONCEPT" },
  { href: "/creators", label: "CREATORS" },
  { href: "/simulation", label: "SIMULATION" },
  { href: "/journal", label: "JOURNAL" },
] as const;

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/">ヒトカラウェディング</Link>
        </div>

        {/* Desktop Nav */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={styles.navLink}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className={styles.ctas}>
          <Link href="#contact" className={styles.ctaOutline}>
            相談を予約
          </Link>
          <a
            href="https://lin.ee/tRn0iPk"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaFill}
          >
            LINEで無料相談
          </a>
        </div>

        {/* Hamburger (mobile) */}
        <button
          className={`${styles.hamburger} ${drawerOpen ? styles.open : ""}`}
          onClick={toggleDrawer}
          aria-label="メニュー"
          aria-expanded={drawerOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`${styles.drawer} ${drawerOpen ? styles.open : ""}`}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={styles.drawerLink}
            onClick={closeDrawer}
          >
            {item.label}
          </Link>
        ))}
        <div className={styles.drawerCtas}>
          <Link
            href="#contact"
            className={styles.ctaOutline}
            onClick={closeDrawer}
          >
            相談を予約
          </Link>
          <a
            href="https://lin.ee/tRn0iPk"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaFill}
            onClick={closeDrawer}
          >
            LINEで無料相談
          </a>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";

type AnimationType = "fadeUp" | "fadeIn" | "scaleIn" | "slideRight";

const ANIM_CLASS_MAP: Record<AnimationType, string> = {
  fadeUp: "anim-up",
  fadeIn: "anim-in",
  scaleIn: "anim-scale",
  slideRight: "anim-right",
};

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
}

export default function AnimateOnScroll({
  children,
  animation = "fadeUp",
  delay = 0,
  className = "",
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Safety fallback: ensure content becomes visible after 2s even if observer never fires
    // (large elements, prefers-reduced-motion, edge browser quirks etc.)
    const safety = setTimeout(() => {
      el.classList.add("vis");
    }, 2000);

    // Use a low threshold (any intersection) so tall blocks always trigger when scrolled.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearTimeout(safety);
          setTimeout(() => {
            el.classList.add("vis");
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);

    return () => {
      clearTimeout(safety);
      observer.disconnect();
    };
  }, [delay]);

  const animClass = ANIM_CLASS_MAP[animation];

  return (
    <div ref={ref} className={`${animClass} ${className}`.trim()}>
      {children}
    </div>
  );
}

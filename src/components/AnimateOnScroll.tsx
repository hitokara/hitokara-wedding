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

    // If user prefers reduced motion, skip animation entirely and show content.
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      el.classList.add("vis");
      return;
    }

    // Use a low threshold (any intersection) so tall blocks always trigger when scrolled.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Double rAF guarantees the initial opacity:0 paint commits before
          // we toggle to opacity:1, so the CSS transition is observable even
          // when the observer fires synchronously on mount.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (delay > 0) {
                setTimeout(() => el.classList.add("vis"), delay);
              } else {
                el.classList.add("vis");
              }
            });
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);

    return () => {
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

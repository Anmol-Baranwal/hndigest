"use client";

import { useEffect } from "react";

/**
 * Attaches a single IntersectionObserver for all `.reveal` elements on the page.
 * Adds the `.is-in` class when they enter the viewport. CSS handles the motion.
 * Honors prefers-reduced-motion via CSS (see globals.css).
 */
export function RevealProvider() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal");
    if (!nodes.length) return;

    // Immediately reveal if IntersectionObserver is unavailable.
    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return null;
}

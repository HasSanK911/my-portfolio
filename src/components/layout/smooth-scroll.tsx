"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-browser-state";

/**
 * Inertial scrolling. Lenis drives the real scroll position (rather than
 * transforming a container), so native scroll events, `IntersectionObserver`
 * and Framer's `useScroll` all keep working unchanged.
 *
 * Disabled outright when the user prefers reduced motion — smoothed scrolling
 * is a common vestibular trigger.
 */
export function SmoothScroll() {
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      smoothWheel: true,
    });

    let frame = requestAnimationFrame(function loop(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}

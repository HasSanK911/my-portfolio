"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/use-browser-state";
import { useCallback, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees on each axis. */
  max?: number;
  /** Renders a pointer-tracked specular sheen across the surface. */
  glare?: boolean;
};

/**
 * CSS 3D tilt driven by pointer position. Uses transforms only (never
 * width/height), keeping the work on the compositor. Touch devices get the
 * static card — hover-only interaction must never be the sole affordance.
 */
export function TiltCard({ children, className, max = 7, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const opacity = useMotionValue(0);

  const springCfg = { stiffness: 150, damping: 18, mass: 0.5 };
  const rotateX = useSpring(rx, springCfg);
  const rotateY = useSpring(ry, springCfg);
  const glareX = useSpring(gx, springCfg);
  const glareY = useSpring(gy, springCfg);
  const glareOpacity = useSpring(opacity, { stiffness: 120, damping: 20 });

  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgb(var(--brand-rgb) / 0.22), transparent 62%)`;

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse" || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      ry.set((px - 0.5) * max * 2);
      rx.set(-(py - 0.5) * max * 2);
      gx.set(px * 100);
      gy.set(py * 100);
      opacity.set(1);
    },
    [max, rx, ry, gx, gy, opacity],
  );

  const reset = useCallback(() => {
    rx.set(0);
    ry.set(0);
    opacity.set(0);
  }, [rx, ry, opacity]);

  if (reduce) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1100 }}
      className={cn("relative", className)}
    >
      {children}
      {glare ? (
        <motion.span
          aria-hidden
          style={{ backgroundImage: glareBg, opacity: glareOpacity }}
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-plus-lighter"
        />
      ) : null}
    </motion.div>
  );
}

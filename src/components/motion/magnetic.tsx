"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/use-browser-state";
import { useCallback, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** 0–1: how far the element chases the pointer, relative to its own size. */
  strength?: number;
};

/**
 * Pointer-following micro-interaction. The spring interpolates continuously,
 * so no throttling is needed; listeners live on the element itself and unmount
 * with it. Skipped entirely for coarse pointers and reduced-motion users.
 */
export function Magnetic({ children, className, strength = 0.32 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 190, damping: 16, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 190, damping: 16, mass: 0.35 });

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse" || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * strength);
      y.set((e.clientY - rect.top - rect.height / 2) * strength);
    },
    [strength, x, y],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (reduce) {
    return <div className={cn("inline-flex", className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      style={{ x: springX, y: springY }}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.div>
  );
}

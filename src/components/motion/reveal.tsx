"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/use-browser-state";
import type { ReactNode } from "react";
import { EASE_EXPO, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 30 },
  down: { x: 0, y: -30 },
  left: { x: 34, y: 0 },
  right: { x: -34, y: 0 },
  none: { x: 0, y: 0 },
};

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header" | "footer";
};

/**
 * Scroll-triggered entrance. Honours `prefers-reduced-motion` by collapsing
 * translation to a plain opacity fade rather than disabling the reveal (which
 * would leave content invisible).
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.75,
  className,
  as = "div",
  ...rest
}: RevealProps) {
  const reduce = useReducedMotionSafe();
  const offset = reduce ? offsets.none : offsets[direction];
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={viewportOnce}
      transition={{
        duration: reduce ? 0.3 : duration,
        delay: reduce ? 0 : delay,
        ease: EASE_EXPO,
      }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
};

/** Wraps a list whose direct `RevealItem` children animate in sequence. */
export function StaggerGroup({ children, className, stagger = 0.08, delay = 0 }: StaggerProps) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduce ? 0 : stagger,
            delayChildren: reduce ? 0 : delay,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
}) {
  const reduce = useReducedMotionSafe();
  const offset = reduce ? offsets.none : offsets[direction];
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...offset },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: reduce ? 0.3 : 0.7, ease: EASE_EXPO },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

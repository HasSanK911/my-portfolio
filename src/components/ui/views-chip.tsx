"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Eye } from "lucide-react";
import { useEffect, useRef } from "react";

import { useSiteViews } from "@/components/analytics/analytics-provider";
import { useReducedMotionSafe } from "@/hooks/use-browser-state";
import { formatCount } from "@/lib/analytics/format";
import { EASE_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * All-time view counter for the hero.
 *
 * The number arrives with the tracking response, so the chip renders an
 * inert placeholder first and fades in once it lands — it never reserves a
 * width it might not fill, and it never shows a misleading zero.
 */
export function ViewsChip({ className }: { className?: string }) {
  const views = useSiteViews();
  const reduce = useReducedMotionSafe();

  const count = useMotionValue(0);
  const label = useTransform(count, (value) => formatCount(value));
  /** Only the first arrival gets the count-up; later updates just tick over. */
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (views === null) return;

    if (reduce || hasAnimated.current) {
      count.set(views);
      hasAnimated.current = true;
      return;
    }

    hasAnimated.current = true;
    // Start close enough that the roll reads as a settle, not a slot machine.
    count.set(Math.max(0, Math.round(views * 0.82)));
    const controls = animate(count, views, { duration: 1.1, ease: EASE_EXPO });
    return () => controls.stop();
  }, [views, reduce, count]);

  if (views === null) return null;

  return (
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_EXPO }}
      className={cn(
        "glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5",
        className,
      )}
    >
      <Eye className="h-3 w-3 text-accent" aria-hidden />
      {/* Mid-animation digits are noise to a screen reader — it gets the
          settled figure from the sibling below instead. */}
      <span className="text-label text-fg-muted" aria-hidden>
        <motion.span className="tabular-nums text-fg">{label}</motion.span>
        {views === 1 ? " view" : " views"}
      </span>
      <span className="sr-only">
        {views === 1 ? "1 total view of this site" : `${formatCount(views)} total views of this site`}
      </span>
    </motion.span>
  );
}

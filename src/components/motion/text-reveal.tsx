"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/use-browser-state";
import { EASE_EXPO, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

type TextRevealProps = {
  text: string;
  className?: string;
  /** Seconds between each word. */
  stagger?: number;
  delay?: number;
  /** Runs on mount instead of on scroll — use for above-the-fold headlines. */
  immediate?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Words rendered in the accent colour, matched case-insensitively. */
  accentWords?: string[];
};

const STRIP = /[.,!?:;"'—–]/g;

/**
 * Word-by-word mask reveal: each word sits in an overflow-clipped span and
 * slides up from beneath it. Screen readers get the whole string once via
 * `aria-label`; the animated words are hidden from the accessibility tree.
 */
export function TextReveal({
  text,
  className,
  stagger = 0.045,
  delay = 0,
  immediate = false,
  as: Tag = "h2",
  accentWords = [],
}: TextRevealProps) {
  const reduce = useReducedMotionSafe();
  const words = text.split(" ");
  const accents = new Set(accentWords.map((w) => w.toLowerCase().replace(STRIP, "")));

  const MotionTag = motion[Tag] as typeof motion.h2;

  if (reduce) {
    return (
      <MotionTag
        className={cn(className)}
        initial={{ opacity: 0 }}
        {...(immediate
          ? { animate: { opacity: 1 } }
          : { whileInView: { opacity: 1 }, viewport: viewportOnce })}
        transition={{ duration: 0.3, delay }}
      >
        {text}
      </MotionTag>
    );
  }

  const trigger = immediate
    ? { initial: "hidden" as const, animate: "show" as const }
    : { initial: "hidden" as const, whileInView: "show" as const, viewport: viewportOnce };

  return (
    <MotionTag
      className={cn(className)}
      aria-label={text}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...trigger}
    >
      {words.map((word, i) => {
        const isAccent = accents.has(word.toLowerCase().replace(STRIP, ""));
        return (
          // The inter-word space is a real text node sitting outside the clip,
          // so headings still wrap naturally at word boundaries.
          <span key={`${word}-${i}`} aria-hidden>
            <span
              className="inline-block overflow-hidden align-bottom"
              // Breathing room so descenders aren't clipped by the mask edge.
              style={{ paddingBottom: "0.14em", marginBottom: "-0.14em" }}
            >
              <motion.span
                className={cn("inline-block", isAccent && "text-brand-gradient italic")}
                variants={{
                  hidden: { y: "115%" },
                  show: { y: "0%", transition: { duration: 0.95, ease: EASE_EXPO } },
                }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </MotionTag>
  );
}

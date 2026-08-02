import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion language.
 *
 * Durations sit in the 260–600ms band and every entrance uses an expo-out
 * curve — fast departure, long settle — so motion reads as physical rather
 * than decorative. Exits are deliberately quicker than entrances.
 */

export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_QUART = [0.25, 1, 0.5, 1] as const;
export const EASE_IN_OUT = [0.83, 0, 0.17, 1] as const;

export const springSoft: Transition = { type: "spring", stiffness: 90, damping: 20, mass: 0.9 };
export const springSnappy: Transition = { type: "spring", stiffness: 280, damping: 26, mass: 0.6 };

/** Viewport config used by every scroll reveal — fires once, slightly early. */
export const viewportOnce = { once: true, margin: "0px 0px -12% 0px" } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: EASE_EXPO },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE_QUART } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE_EXPO } },
};

/** Parent that staggers its children. Pair with `fadeUp` on each child. */
export function staggerParent(stagger = 0.07, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

/** Word/line mask reveal — child slides up out of an overflow-hidden clip. */
export const maskChild: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.9, ease: EASE_EXPO } },
};

/** Motion-safe variants: collapses movement to a plain fade. */
export const reducedFade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

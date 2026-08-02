"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/use-browser-state";
import { SceneFallback } from "./scene-fallback";

// three.js + drei are heavy and browser-only. Keep them out of the server
// bundle and off the critical path — the CSS fallback holds the space until
// the chunk lands.
const BackgroundCanvas = dynamic(
  () => import("./background-canvas").then((m) => m.BackgroundCanvas),
  { ssr: false, loading: () => <SceneFallback /> },
);

/**
 * Fixed backdrop that lives behind every section. It dims as the page scrolls
 * so body copy always wins the contrast contest against the scene.
 */
export function Backdrop() {
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.4], [1, 0.85, 0.32]);

  return (
    <motion.div
      aria-hidden
      style={{ opacity: reduce ? 0.5 : opacity }}
      className="pointer-events-none fixed inset-0 z-0"
    >
      <BackgroundCanvas />

      {/* Vignette: darkens the frame edges and lifts text legibility. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 30%, transparent 30%, rgb(var(--bg-rgb) / 0.55) 72%, rgb(var(--bg-rgb) / 0.92) 100%)",
        }}
      />

      {/* Phones have no empty column for the object, so below `md` the scene
          is pushed back behind a scrim — it becomes texture, and body copy
          keeps its full contrast rather than sitting on a bright surface. */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgb(var(--bg-rgb) / 0.45) 0%, rgb(var(--bg-rgb) / 0.82) 42%, rgb(var(--bg-rgb) / 0.94) 100%)",
        }}
      />
    </motion.div>
  );
}

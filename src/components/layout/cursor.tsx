"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/use-browser-state";
import { cn } from "@/lib/utils";

/** Corner brackets of the viewfinder — sized as a share of the frame so they
 *  scale with it instead of needing four extra animations. */
const CORNERS = [
  "left-0 top-0 border-l border-t",
  "right-0 top-0 border-r border-t",
  "left-0 bottom-0 border-l border-b",
  "right-0 bottom-0 border-r border-b",
];

/**
 * Two-part custom cursor: a 1:1 dot and a lagging camera viewfinder — a diamond
 * reticle at rest that squares up and opens over interactive targets.
 *
 * Only mounts for fine pointers with motion enabled — and the native cursor is
 * hidden (via a class on <html>) only while this component is actually live,
 * so a bailout can never leave the page cursorless.
 */
export function Cursor() {
  const finePointer = useMediaQuery("(pointer: fine)");
  const reduce = usePrefersReducedMotion();
  const enabled = finePointer && !reduce;

  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 30, mass: 0.35 });
  const ringY = useSpring(y, { stiffness: 320, damping: 30, mass: 0.35 });

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      const target = e.target as HTMLElement | null;
      setHovering(
        Boolean(
          target?.closest('a, button, [role="button"], input, textarea, select, [data-cursor="hover"]'),
        ),
      );
    };

    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      {/* Focus point — tracks the pointer exactly, recedes once the frame
          takes over as the hover affordance. */}
      <motion.div
        className="absolute rounded-full bg-brand"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 4 : 6,
          height: hovering ? 4 : 6,
          opacity: visible ? (hovering ? 0.55 : 1) : 0,
          scale: pressed ? 0.5 : 1,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      />

      {/* Viewfinder — lags behind on a spring, rotates from diamond to square
          and opens up over anything interactive. */}
      <motion.div
        className="absolute"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 44 : 22,
          height: hovering ? 44 : 22,
          rotate: hovering ? 0 : 45,
          opacity: visible ? (hovering ? 1 : 0.5) : 0,
          scale: pressed ? 0.82 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 26, mass: 0.5 }}
      >
        {CORNERS.map((corner) => (
          <span key={corner} className={cn("absolute h-[32%] w-[32%] border-brand", corner)} />
        ))}
      </motion.div>
    </div>
  );
}

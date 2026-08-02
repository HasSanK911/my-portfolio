"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";
import { EASE_EXPO, EASE_IN_OUT } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/use-browser-state";
import { profile } from "@/lib/data";

const STORAGE_KEY = "ahk:intro-seen";
const DURATION_MS = 1500;

const noopSubscribe = () => () => {};

/**
 * Whether the intro has already run this session. The server snapshot is
 * `true` so nothing is server-rendered; React swaps in the real value right
 * after hydration.
 */
function useIntroSeen(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return sessionStorage.getItem(STORAGE_KEY) !== null;
      } catch {
        // Private mode / storage disabled — treat as seen and skip the intro.
        return true;
      }
    },
    () => true,
  );
}

/**
 * First-visit intro curtain. Deliberately short and shown once per session —
 * an interstitial that reappears on every navigation is friction, not polish.
 * Skipped entirely for reduced-motion users.
 */
export function Preloader() {
  const reduce = usePrefersReducedMotion();
  const seen = useIntroSeen();
  const [finished, setFinished] = useState(false);
  const [progress, setProgress] = useState(0);

  const visible = !reduce && !seen && !finished;

  useEffect(() => {
    if (!visible) return;

    document.body.style.overflow = "hidden";
    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - started) / DURATION_MS, 1);
      // Ease-out so the counter decelerates into 100 rather than snapping.
      setProgress(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // Non-fatal: the intro simply runs again next visit.
      }
      setFinished(true);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: EASE_IN_OUT }}
          // Announced politely so screen-reader users aren't left in silence.
          role="status"
          aria-live="polite"
          aria-label="Loading portfolio"
        >
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_EXPO }}
            className="text-display"
          >
            {profile.firstName} <span className="text-brand-gradient italic">{profile.lastName}</span>
          </motion.span>

          <div className="mt-8 flex w-[min(22rem,70vw)] flex-col gap-3">
            <div className="h-px w-full overflow-hidden bg-line-strong">
              <div className="h-full bg-brand" style={{ width: `${progress}%` }} aria-hidden />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-label text-fg-subtle">{profile.role}</span>
              <span className="text-label text-accent tabular-nums">{progress}%</span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Browser state is an external store, not React state — reading it with
 * `useSyncExternalStore` keeps SSR, hydration and live updates consistent
 * without the cascading re-renders that `setState`-inside-`useEffect` causes.
 */

/** Subscription for values that can never change after mount. */
const noopSubscribe = () => () => {};

/**
 * `false` during SSR and the first render, `true` afterwards. Use to defer
 * rendering anything whose correct value is unknowable on the server.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Live media query result. Stays reactive — a user toggling an OS-level
 * preference such as reduced motion mid-session is reflected immediately.
 * Returns `false` during SSR.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/**
 * Raw reduced-motion preference. Reflects the OS setting on the client and
 * `false` on the server.
 *
 * Do NOT branch component *structure* on this — the server always renders the
 * non-reduced tree, so a reduced-motion user would hydrate a different DOM and
 * React would bail out with a mismatch. Use `useReducedMotionSafe` for that.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Reduced-motion preference that is safe to branch markup on.
 *
 * Stays `false` through the first client render so hydration matches the
 * server byte for byte, then flips to the real value on the very next commit.
 * The cost is one frame of the animated tree; the alternative is a hydration
 * error for every reduced-motion visitor.
 */
export function useReducedMotionSafe(): boolean {
  const mounted = useMounted();
  const prefers = usePrefersReducedMotion();
  return mounted && prefers;
}

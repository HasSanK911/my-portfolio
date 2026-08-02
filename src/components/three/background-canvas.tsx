"use client";

import { Canvas } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { Suspense, useCallback, useSyncExternalStore } from "react";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { usePrefersReducedMotion } from "@/hooks/use-browser-state";
import { Scene } from "./scene";
import { SceneFallback } from "./scene-fallback";

/**
 * True while the scene is worth rendering: the tab is visible and the canvas
 * has not been scrolled far out of sight. Modelled as an external store so the
 * render loop can be halted without a re-render cascade.
 */
function useSceneActive(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange, { passive: true });
    document.addEventListener("visibilitychange", onChange);
    return () => {
      window.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
      document.removeEventListener("visibilitychange", onChange);
    };
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => !document.hidden && window.scrollY < window.innerHeight * 1.6,
    () => true,
  );
}

/**
 * The single WebGL surface for the entire page.
 *
 * Exactly one renderer exists for the page lifetime — browsers cap concurrent
 * GPU contexts at 8–16 and mobile drops them aggressively, so extra canvases
 * are never worth it. The scene reacts to scroll rather than being remounted
 * per section.
 */
export function BackgroundCanvas() {
  const { tier, webglSupported } = useDeviceTier();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const noMotion = usePrefersReducedMotion();
  const active = useSceneActive();

  // `tier === null` means we are still on the server snapshot; WebGL absent or
  // blocked means we never get a scene at all. Both render the CSS stand-in.
  if (tier === null || !webglSupported) {
    return <SceneFallback />;
  }

  return (
    <Canvas
      // `never` fully halts the render loop; `always` resumes it.
      frameloop={active ? "always" : "never"}
      // Cap the pixel ratio — retina phones otherwise render 3x the pixels.
      dpr={[1, tier === "high" ? 2 : 1.5]}
      gl={{
        antialias: tier !== "low",
        alpha: false,
        powerPreference: tier === "low" ? "low-power" : "high-performance",
      }}
      camera={{ position: [0, 0, 5.6], fov: 42, near: 0.1, far: 40 }}
      // Decorative: the scene conveys nothing not already present in the DOM.
      aria-hidden
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <Scene tier={tier} isDark={isDark} noMotion={noMotion} />
      </Suspense>
    </Canvas>
  );
}

"use client";

import { useSyncExternalStore } from "react";

export type DeviceTier = "high" | "medium" | "low";

export type DeviceCapabilities = {
  /** `null` on the server — render nothing GPU-heavy until this resolves. */
  tier: DeviceTier | null;
  /** Coarse pointer (touch): hover must never be the only affordance. */
  isTouch: boolean;
  /** WebGL unavailable or blocked — callers must render a CSS fallback. */
  webglSupported: boolean;
};

const SERVER_SNAPSHOT: DeviceCapabilities = {
  tier: null,
  isTouch: false,
  webglSupported: true,
};

function detectWebgl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    // Release immediately — browsers cap concurrent GPU contexts at 8–16 and
    // a leaked probe context can starve the real renderer on mobile.
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function measure(): DeviceCapabilities {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  // `deviceMemory` is Chromium-only; its absence is not evidence of a weak device.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const narrow = window.innerWidth < 768;
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ?? false;

  let tier: DeviceTier = "high";
  if (saveData || cores <= 4 || memory <= 4) tier = "low";
  else if (coarse || narrow || cores <= 6) tier = "medium";

  return { tier, isTouch: coarse, webglSupported: detectWebgl() };
}

/**
 * Measured once per page load and cached, so the snapshot reference stays
 * stable — `useSyncExternalStore` re-renders in a loop otherwise.
 */
let cached: DeviceCapabilities | null = null;
function getSnapshot(): DeviceCapabilities {
  cached ??= measure();
  return cached;
}

const noopSubscribe = () => () => {};

/**
 * Classifies the device so the 3D scene can scale its particle count, pixel
 * ratio and effect budget. Desktop and mobile GPU throughput can differ by
 * 10:1, so a single hardcoded quality level is never right for both.
 */
export function useDeviceTier(): DeviceCapabilities {
  return useSyncExternalStore(noopSubscribe, getSnapshot, () => SERVER_SNAPSHOT);
}

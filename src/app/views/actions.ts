"use server";

import { headers } from "next/headers";

import {
  attemptLogin,
  endSession,
  hasSession,
  isConfigured,
  setSelfExcluded,
} from "@/lib/analytics/auth";
import { rateLimitKey } from "@/lib/analytics/request";

/**
 * Server actions behind /views. Each one re-checks authorisation: a Server
 * Action is a public POST endpoint, and the fact that the form is only
 * rendered to an authenticated page proves nothing about the caller.
 */

export type LoginState = { error: string | null };

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!isConfigured()) {
    return { error: "VIEWS_PASSWORD is not set on this deployment." };
  }

  const candidate = formData.get("password");
  if (typeof candidate !== "string" || candidate.length === 0) {
    return { error: "Enter the password." };
  }
  if (candidate.length > 256) {
    return { error: "That is not the password." };
  }

  // headers() gives us the same request the action arrived on, so the throttle
  // buckets by caller rather than globally.
  const requestHeaders = await headers();
  const key = rateLimitKey(new Request("https://local/", { headers: requestHeaders }));

  const result = await attemptLogin(candidate, key);

  switch (result) {
    case "ok":
      // Setting a cookie re-renders the route, which is what reveals the
      // dashboard — no redirect needed.
      return { error: null };
    case "locked":
      return { error: "Too many attempts. Try again in 15 minutes." };
    case "unconfigured":
      return { error: "VIEWS_PASSWORD is not set on this deployment." };
    default:
      return { error: "Incorrect password." };
  }
}

export async function logout(): Promise<void> {
  await endSession();
}

export async function toggleSelfExclusion(excluded: boolean): Promise<void> {
  if (!(await hasSession())) return;
  await setSelfExcluded(excluded);
}

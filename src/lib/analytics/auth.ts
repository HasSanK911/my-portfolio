import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { analyticsStore, readJson, update } from "./store";

/**
 * Access control for /views.
 *
 * The gate is a single shared password held in VIEWS_PASSWORD. On success the
 * server issues a signed, httpOnly cookie carrying nothing but an expiry — the
 * password never round-trips again and the cookie is worthless if the signing
 * key changes.
 *
 * If VIEWS_PASSWORD is unset the dashboard refuses everyone. An analytics page
 * that fails open is worse than one that fails to load.
 */

export const SESSION_COOKIE = "views_session";

/** Cookie that makes the tracker a no-op — set for the owner after login. */
export const EXCLUDE_COOKIE = "views_exclude";

/** Cookie holding the opaque per-visitor id. */
export const VISITOR_COOKIE = "pv_id";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const VISITOR_TTL_S = 365 * 24 * 60 * 60;

/** Failed logins allowed per IP hash inside the window before lockout. */
const MAX_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

function password(): string | null {
  const value = process.env.VIEWS_PASSWORD;
  return value && value.length > 0 ? value : null;
}

export function isConfigured(): boolean {
  return password() !== null;
}

/**
 * Key used to sign session cookies. Falls back to deriving from the password
 * so the feature works with one env var set; VIEWS_SECRET only matters if you
 * want sessions to survive a password change.
 */
function signingKey(): string {
  return process.env.VIEWS_SECRET ?? `derived:${password() ?? randomBytes(16).toString("hex")}`;
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

/** Constant-time string comparison that tolerates differing lengths. */
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");
  // timingSafeEqual throws on length mismatch, which would itself leak length.
  // Hashing first gives both sides a fixed width.
  const hashA = createHmac("sha256", "compare").update(bufferA).digest();
  const hashB = createHmac("sha256", "compare").update(bufferB).digest();
  return timingSafeEqual(hashA, hashB);
}

/* ----------------------------------------------------------------- session */

function issueToken(): string {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  return `${expiresAt}.${sign(expiresAt)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator < 1) return false;

  const expiresAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (!safeEqual(signature, sign(expiresAt))) return false;

  const expiry = Number(expiresAt);
  return Number.isFinite(expiry) && expiry > Date.now();
}

/** True when the current request carries a valid dashboard session. */
export async function hasSession(): Promise<boolean> {
  if (!isConfigured()) return false;
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

export async function startSession(): Promise<void> {
  const store = await cookies();

  store.set(SESSION_COOKIE, issueToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });

  // Owning the dashboard means your own visits would otherwise pollute it.
  store.set(EXCLUDE_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: VISITOR_TTL_S,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function setSelfExcluded(excluded: boolean): Promise<void> {
  const store = await cookies();
  if (excluded) {
    store.set(EXCLUDE_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: VISITOR_TTL_S,
    });
  } else {
    store.delete(EXCLUDE_COOKIE);
  }
}

export async function isSelfExcluded(): Promise<boolean> {
  const store = await cookies();
  return store.get(EXCLUDE_COOKIE)?.value === "1";
}

/* -------------------------------------------------------------- rate limit */

type AttemptRecord = { count: number; firstAt: number };

/**
 * Login throttle, kept in the blob store so it survives the serverless cold
 * starts that would reset an in-process counter.
 */
export async function registerFailure(key: string): Promise<void> {
  const now = Date.now();
  await update<AttemptRecord>(
    `rl/${key}`,
    () => ({ count: 0, firstAt: now }),
    (current) =>
      now - current.firstAt > ATTEMPT_WINDOW_MS
        ? { count: 1, firstAt: now }
        : { count: current.count + 1, firstAt: current.firstAt },
  );
}

export async function isLockedOut(key: string): Promise<boolean> {
  const record = await readJson<AttemptRecord>(`rl/${key}`);
  if (!record) return false;
  if (Date.now() - record.firstAt > ATTEMPT_WINDOW_MS) return false;
  return record.count >= MAX_ATTEMPTS;
}

export async function clearFailures(key: string): Promise<void> {
  await analyticsStore()
    .remove(`rl/${key}`)
    .catch(() => {});
}

/* ------------------------------------------------------------------- login */

export type LoginResult = "ok" | "invalid" | "locked" | "unconfigured";

export async function attemptLogin(candidate: string, key: string): Promise<LoginResult> {
  const expected = password();
  if (!expected) return "unconfigured";

  if (await isLockedOut(key)) return "locked";

  if (!safeEqual(candidate, expected)) {
    await registerFailure(key);
    return "invalid";
  }

  await clearFailures(key);
  await startSession();
  return "ok";
}

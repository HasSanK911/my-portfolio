/**
 * Tuning constants that both halves of the feature need.
 *
 * These live apart from `record.ts` because that module is server-only — the
 * dashboard runs in the browser and still has to agree on what "live" means.
 */

/** A gap longer than this starts a new session. */
export const SESSION_GAP_MS = 30 * 60 * 1000;

/** How recently a visitor must have pinged to count as "on the site now". */
export const LIVE_WINDOW_MS = 60 * 1000;

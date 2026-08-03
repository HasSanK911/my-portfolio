import "server-only";

import { getStore, type Store } from "@netlify/blobs";

/**
 * Storage for visitor analytics.
 *
 * Netlify Blobs is the real backend — it needs no configuration on a Netlify
 * deploy because the runtime injects the credentials into the function
 * environment. `next dev` has no such environment, so we transparently fall
 * back to a process-local map. That fallback is *not* persistent and does not
 * survive a serverless cold start; `ephemeral` is surfaced all the way to the
 * dashboard so the numbers there are never mistaken for real ones.
 *
 * Every mutating path goes through `update()`, which is a compare-and-swap
 * loop built on the store's ETag preconditions. Two visitors landing in the
 * same millisecond would otherwise clobber each other's increment.
 */

const STORE_NAME = "portfolio-analytics";

/** Retries for a CAS write before we accept the lost update and move on. */
const MAX_CAS_ATTEMPTS = 5;

export type ReadResult<T> = { data: T; etag?: string };

export interface AnalyticsStore {
  /** True when writes land in memory rather than in Netlify Blobs. */
  readonly ephemeral: boolean;
  read<T>(key: string): Promise<ReadResult<T> | null>;
  write(
    key: string,
    data: unknown,
    options?: { onlyIfMatch?: string; onlyIfNew?: boolean },
  ): Promise<{ modified: boolean }>;
  listKeys(prefix: string): Promise<string[]>;
  remove(key: string): Promise<void>;
}

/* ------------------------------------------------------------ blobs driver */

class BlobsStore implements AnalyticsStore {
  readonly ephemeral = false;

  constructor(private readonly store: Store) {}

  async read<T>(key: string): Promise<ReadResult<T> | null> {
    const result = await this.store.getWithMetadata(key, { type: "json" });
    if (!result) return null;
    return { data: result.data as T, etag: result.etag };
  }

  async write(
    key: string,
    data: unknown,
    options?: { onlyIfMatch?: string; onlyIfNew?: boolean },
  ) {
    if (options?.onlyIfNew) {
      const { modified } = await this.store.setJSON(key, data, { onlyIfNew: true });
      return { modified };
    }
    if (options?.onlyIfMatch) {
      const { modified } = await this.store.setJSON(key, data, {
        onlyIfMatch: options.onlyIfMatch,
      });
      return { modified };
    }
    const { modified } = await this.store.setJSON(key, data);
    return { modified };
  }

  async listKeys(prefix: string) {
    const { blobs } = await this.store.list({ prefix });
    return blobs.map((blob) => blob.key);
  }

  async remove(key: string) {
    await this.store.delete(key);
  }
}

/* ------------------------------------------------------------ dev fallback */

type MemoryEntry = { value: string; etag: string };

type MemoryBacking = { entries: Map<string, MemoryEntry>; counter: number };

/**
 * Parked on globalThis rather than in module scope on purpose.
 *
 * Next bundles Route Handlers and Server Components into separate module
 * graphs, so a module-level Map is instantiated twice — the tracking endpoint
 * would write to one copy and the dashboard would read an empty other one.
 * Blobs is a shared external store and never has this problem; the dev
 * fallback has to reach for a shared slot to match that behaviour.
 */
const MEMORY_KEY = Symbol.for("portfolio.analytics.memory");

function backing(): MemoryBacking {
  const host = globalThis as typeof globalThis & { [MEMORY_KEY]?: MemoryBacking };
  host[MEMORY_KEY] ??= { entries: new Map(), counter: 0 };
  return host[MEMORY_KEY];
}

class MemoryStore implements AnalyticsStore {
  readonly ephemeral = true;

  async read<T>(key: string): Promise<ReadResult<T> | null> {
    const entry = backing().entries.get(key);
    if (!entry) return null;
    return { data: JSON.parse(entry.value) as T, etag: entry.etag };
  }

  async write(
    key: string,
    data: unknown,
    options?: { onlyIfMatch?: string; onlyIfNew?: boolean },
  ) {
    const store = backing();
    const existing = store.entries.get(key);
    if (options?.onlyIfNew && existing) return { modified: false };
    if (options?.onlyIfMatch && existing?.etag !== options.onlyIfMatch) {
      return { modified: false };
    }
    store.counter += 1;
    store.entries.set(key, {
      value: JSON.stringify(data),
      etag: `mem-${store.counter}`,
    });
    return { modified: true };
  }

  async listKeys(prefix: string) {
    return [...backing().entries.keys()].filter((key) => key.startsWith(prefix));
  }

  async remove(key: string) {
    backing().entries.delete(key);
  }
}

/* ---------------------------------------------------------------- resolver */

let cached: AnalyticsStore | null = null;

export function analyticsStore(): AnalyticsStore {
  if (cached) return cached;

  try {
    // Strong consistency matters: the CAS loop below must not read a stale
    // copy, or it will happily retry against data it can never match.
    cached = new BlobsStore(getStore({ name: STORE_NAME, consistency: "strong" }));
  } catch {
    // getStore throws when the Netlify Blobs environment is absent, which is
    // the normal case under `next dev`.
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[analytics] Netlify Blobs unavailable — falling back to in-memory storage. " +
          "Visitor data will not persist.",
      );
    }
    cached = new MemoryStore();
  }

  return cached;
}

/* -------------------------------------------------------------------- CAS */

/**
 * Read the value at `key`, apply `mutate`, and write it back only if nobody
 * else wrote in the meantime. Retries on conflict.
 *
 * `mutate` must be pure with respect to its argument's identity — it may be
 * called several times, so it should build and return a new value rather than
 * relying on side effects.
 *
 * Returns the value that was successfully written, or the last computed value
 * if every attempt lost the race (the increment is dropped, not the request).
 */
export async function update<T>(
  key: string,
  initial: () => T,
  mutate: (current: T, exists: boolean) => T,
): Promise<T> {
  const store = analyticsStore();
  let next: T = mutate(initial(), false);

  for (let attempt = 0; attempt < MAX_CAS_ATTEMPTS; attempt++) {
    const current = await store.read<T>(key);

    if (!current) {
      next = mutate(initial(), false);
      const { modified } = await store.write(key, next, { onlyIfNew: true });
      if (modified) return next;
      continue; // Someone created it first — re-read and merge onto theirs.
    }

    next = mutate(current.data, true);

    if (!current.etag) {
      // No precondition available; last write wins.
      await store.write(key, next);
      return next;
    }

    const { modified } = await store.write(key, next, { onlyIfMatch: current.etag });
    if (modified) return next;
  }

  console.warn(`[analytics] gave up on contended key after ${MAX_CAS_ATTEMPTS} attempts: ${key}`);
  return next;
}

/** Read a JSON value, or `null` when the key is absent or unparseable. */
export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const result = await analyticsStore().read<T>(key);
    return result?.data ?? null;
  } catch (error) {
    console.warn(`[analytics] read failed for ${key}`, error);
    return null;
  }
}

/** Map over items with a ceiling on in-flight promises. */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  });

  await Promise.all(workers);
  return results;
}

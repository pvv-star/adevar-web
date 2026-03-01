// lib/fetch-cache.js — Generic TTL + stale-while-revalidate client cache

const cache = new Map();

/**
 * Returns cached data if fresh, stale data while revalidating in background,
 * or fetches fresh data if nothing is cached.
 *
 * @param {string} key - Cache key
 * @param {() => Promise<any>} fetcher - Async function that returns data
 * @param {{ ttl?: number, swr?: number }} opts - ttl: fresh duration (ms), swr: stale-while-revalidate window (ms)
 */
export async function cachedFetch(key, fetcher, { ttl = 30_000, swr = 60_000 } = {}) {
  const now = Date.now();
  const entry = cache.get(key);

  if (entry) {
    const age = now - entry.ts;

    // Fresh — return immediately
    if (age < ttl) return entry.data;

    // Stale but within SWR window — return stale, revalidate in background
    if (age < swr) {
      if (!entry.revalidating) {
        entry.revalidating = true;
        fetcher().then(data => {
          cache.set(key, { data, ts: Date.now(), revalidating: false });
        }).catch(() => {
          entry.revalidating = false;
        });
      }
      return entry.data;
    }
  }

  // No cache or expired beyond SWR — fetch fresh
  const data = await fetcher();
  cache.set(key, { data, ts: Date.now(), revalidating: false });
  return data;
}

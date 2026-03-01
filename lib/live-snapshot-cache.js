// lib/live-snapshot-cache.js — Shared in-memory cache for live-snapshot API
// Prevents duplicate fetches from Header and Dashboard

let cache = { data: null, ts: 0 };
const TTL = 30_000; // 30s cache

export async function fetchLiveSnapshot(signal) {
  const now = Date.now();
  if (cache.data && now - cache.ts < TTL) {
    return cache.data;
  }
  const res = await fetch('/api/widgets/live-snapshot', { cache: 'no-store', signal });
  const payload = await res.json();
  if (!res.ok || !payload?.ok) return null;
  cache = { data: payload, ts: now };
  return payload;
}

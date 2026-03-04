// lib/live-snapshot-cache.js — Shared cache for live-snapshot API
// Prevents duplicate fetches from Header and Dashboard

import { cachedFetch } from './fetch-cache';

export async function fetchLiveSnapshot(signal) {
  return cachedFetch('live-snapshot', async () => {
    const res = await fetch('/api/widgets/live-snapshot', { cache: 'no-store', signal });
    const payload = await res.json();
    if (!res.ok || !payload?.ok) return null;
    return payload;
  }, { ttl: 60_000, swr: 120_000 });
}

const globalState = globalThis;

if (!globalState.__adevarIngestLimiter) {
  globalState.__adevarIngestLimiter = new Map();
}

const limiter = globalState.__adevarIngestLimiter;

export function checkIngestRateLimit(key, { max = 20, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const entry = limiter.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  limiter.set(key, entry);

  return {
    allowed: entry.count <= max,
    count: entry.count,
    resetAt: entry.resetAt,
    max,
  };
}

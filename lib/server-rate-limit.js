const buckets = new Map();
let lastGc = Date.now();

function gc() {
  const now = Date.now();
  // Run at most every 30s
  if (now - lastGc < 30_000) return;
  lastGc = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function applyRateLimit(key, { windowMs = 60_000, limit = 60 } = {}) {
  gc();
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs };
    buckets.set(key, next);
    return { allowed: true, remaining: limit - 1, resetAt: next.resetAt };
  }

  current.count += 1;
  const allowed = current.count <= limit;
  return { allowed, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}

export function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

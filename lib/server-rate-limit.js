import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis = null;

function getRedis() {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redis = new Redis({ url, token });
  }
  return redis;
}

// In-memory fallback for local dev (no Redis)
const fallbackBuckets = new Map();

function fallbackRateLimit(key, { windowMs = 60_000, limit = 60 } = {}) {
  const now = Date.now();
  const current = fallbackBuckets.get(key);

  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs };
    fallbackBuckets.set(key, next);
    return { allowed: true, remaining: limit - 1, resetAt: next.resetAt };
  }

  current.count += 1;
  const allowed = current.count <= limit;
  return { allowed, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}

const limiters = new Map();

function getLimiter(prefix, { windowMs, limit }) {
  const cacheKey = `${prefix}:${limit}:${windowMs}`;
  if (limiters.has(cacheKey)) return limiters.get(cacheKey);

  const r = getRedis();
  if (!r) return null;

  const windowSec = Math.ceil(windowMs / 1000);
  const rl = new Ratelimit({
    redis: r,
    prefix: `adevar:${prefix}`,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
  });
  limiters.set(cacheKey, rl);
  return rl;
}

export async function applyRateLimit(key, { windowMs = 60_000, limit = 60 } = {}) {
  const prefix = key.split(':')[0] || 'api';
  const limiter = getLimiter(prefix, { windowMs, limit });

  if (!limiter) {
    return fallbackRateLimit(key, { windowMs, limit });
  }

  const result = await limiter.limit(key);
  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
  };
}

export function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

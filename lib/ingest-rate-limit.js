import { applyRateLimit } from '@/lib/server-rate-limit';

export async function checkIngestRateLimit(key, { max = 20, windowMs = 60_000 } = {}) {
  const result = await applyRateLimit(key, { limit: max, windowMs });
  return {
    allowed: result.allowed,
    count: max - result.remaining,
    resetAt: result.resetAt,
    max,
  };
}

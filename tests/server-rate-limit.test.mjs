import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

it('requires a distributed limiter for production chat instead of silently allowing local quotas', async () => {
  vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
  vi.resetModules();
  const { applyRateLimit } = await import('../lib/server-rate-limit.js');
  await expect(applyRateLimit('chat:client', { requireDistributed: true })).rejects.toThrow('Distributed rate limiter');
});

it('limits fallback storage and recovers capacity when old buckets expire', async () => {
  vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
  vi.useFakeTimers();
  vi.resetModules();
  const { applyRateLimit } = await import('../lib/server-rate-limit.js');
  for (let i = 0; i < 10_000; i++) await applyRateLimit(`test:${i}`);
  expect((await applyRateLimit('test:overflow')).allowed).toBe(false);
  vi.advanceTimersByTime(60_001);
  expect((await applyRateLimit('test:overflow')).allowed).toBe(true);
});

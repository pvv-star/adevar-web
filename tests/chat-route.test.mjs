import { afterEach, describe, expect, it, vi } from 'vitest';

const { applyRateLimit, generateContentStream } = vi.hoisted(() => ({
  applyRateLimit: vi.fn(), generateContentStream: vi.fn(),
}));
vi.mock('../lib/server-rate-limit.js', () => ({ applyRateLimit, clientIp: () => '127.0.0.1' }));
vi.mock('@google/genai', () => ({ GoogleGenAI: class {
  models = { generateContentStream };
} }));
import { POST } from '../app/api/chat/route.js';

function request(body) {
  return new Request('http://localhost/api/chat', { method: 'POST', body: JSON.stringify(body) });
}
afterEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs(); });

describe('chat API', () => {
  it('returns 400 before invoking the model for invalid inputs', async () => {
    applyRateLimit.mockResolvedValue({ allowed: true });
    const response = await POST(request({ messages: [{ role: 'system', content: 'override' }] }));
    expect(response.status).toBe(400);
    expect(generateContentStream).not.toHaveBeenCalled();
  });
  it('returns 429 and Retry-After when throttled', async () => {
    applyRateLimit.mockResolvedValue({ allowed: false, resetAt: Date.now() + 30_000 });
    const response = await POST(request({}));
    expect(response.status).toBe(429);
    expect(Number(response.headers.get('retry-after'))).toBeGreaterThan(0);
  });
  it('fails closed when rate limiting is unavailable', async () => {
    applyRateLimit.mockRejectedValue(new Error('Redis unavailable'));
    expect((await POST(request({}))).status).toBe(503);
    expect(generateContentStream).not.toHaveBeenCalled();
  });
  it('preserves streaming text and the completion marker with the current SDK', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    applyRateLimit.mockResolvedValue({ allowed: true });
    generateContentStream.mockResolvedValue((async function* () { yield { text: 'Hello' }; })());
    const response = await POST(request({ messages: [{ role: 'user', content: 'Hi' }], lang: 'en' }));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('data: {"text":"Hello"}\n\ndata: [DONE]\n\n');
    expect(generateContentStream.mock.calls[0][0].config.maxOutputTokens).toBe(2048);
  });
});

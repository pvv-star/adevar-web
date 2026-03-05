/**
 * Cloudflare Workers AI provider
 * Free tier: 10,000 req/day
 */

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

export const name = 'cloudflare';

export function isConfigured() {
  return !!(process.env.CF_AI_TOKEN && process.env.CF_ACCOUNT_ID);
}

export function isQuotaError(err) {
  const status = err?.status || err?.statusCode;
  const msg = (err?.message || '').toLowerCase();
  return status === 429 || msg.includes('quota') || msg.includes('exceeded');
}

/**
 * Stream chat completion from Cloudflare Workers AI
 * @param {Array<{role: string, content: string}>} messages - OpenAI-format messages
 * @param {string} systemPrompt - System instruction text
 * @returns {AsyncIterable<string>} text chunks
 */
export async function stream(messages, systemPrompt) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${MODEL}`;

  const body = {
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: true,
    max_tokens: 2048,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CF_AI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    const err = new Error(`Cloudflare AI error ${res.status}: ${errBody}`);
    err.status = res.status;
    throw err;
  }

  return {
    async *[Symbol.asyncIterator]() {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const text = parsed.response;
              if (text) yield text;
            } catch {
              // skip malformed chunks
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  };
}

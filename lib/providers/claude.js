/**
 * Claude Haiku provider (premium tier only)
 * Uses Anthropic Messages API with streaming
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

export const name = 'claude';

export function isConfigured() {
  return !!process.env.ANTHROPIC_API_KEY;
}

export function isQuotaError(err) {
  const status = err?.status || err?.statusCode;
  const msg = (err?.message || '').toLowerCase();
  return status === 429 || msg.includes('rate_limit') || msg.includes('overloaded');
}

/**
 * Stream chat completion from Claude Haiku
 * @param {Array<{role: string, content: string}>} messages - OpenAI-format messages
 * @param {string} systemPrompt - System instruction text
 * @returns {AsyncIterable<string>} text chunks
 */
export async function stream(messages, systemPrompt) {
  const body = {
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.content,
    })),
    stream: true,
  };

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    const err = new Error(`Claude API error ${res.status}: ${errBody}`);
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
              // Anthropic SSE: content_block_delta events carry the text
              if (parsed.type === 'content_block_delta') {
                const text = parsed.delta?.text;
                if (text) yield text;
              }
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

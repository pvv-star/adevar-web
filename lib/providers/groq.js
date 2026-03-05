/**
 * Groq Llama provider (OpenAI-compatible API)
 * Free tier: 14,400 req/day
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export const name = 'groq';

export function isConfigured() {
  return !!process.env.GROQ_API_KEY;
}

export function isQuotaError(err) {
  const status = err?.status || err?.statusCode;
  const msg = (err?.message || '').toLowerCase();
  return status === 429 || msg.includes('quota') || msg.includes('rate_limit');
}

/**
 * Stream chat completion from Groq
 * @param {Array<{role: string, content: string}>} messages - OpenAI-format messages
 * @param {string} systemPrompt - System instruction text
 * @returns {AsyncIterable<string>} text chunks
 */
export async function stream(messages, systemPrompt) {
  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 2048,
  };

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    const err = new Error(`Groq API error ${res.status}: ${errBody}`);
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
              const text = parsed.choices?.[0]?.delta?.content;
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

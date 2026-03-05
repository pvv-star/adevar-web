/**
 * Gemini 2.0 Flash provider
 * Free tier: 1,500 req/day
 */

export const name = 'gemini';

export function isConfigured() {
  return !!process.env.GEMINI_API_KEY;
}

export function isQuotaError(err) {
  const status = err?.status || err?.statusCode;
  const msg = (err?.message || '').toLowerCase();
  return status === 429 || msg.includes('quota') || msg.includes('resource exhausted');
}

/**
 * Stream chat completion from Gemini 2.0 Flash
 * @param {Array<{role: string, content: string}>} messages - OpenAI-format messages
 * @param {string} systemPrompt - System instruction text
 * @returns {AsyncIterable<string>} text chunks
 */
export async function stream(messages, systemPrompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Convert to Gemini format: history (all but last) + last message
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const chat = model.startChat({
    history,
    systemInstruction: { parts: [{ text: systemPrompt }] },
  });

  const result = await chat.sendMessageStream(lastMessage.content);

  return {
    async *[Symbol.asyncIterator]() {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
    },
  };
}

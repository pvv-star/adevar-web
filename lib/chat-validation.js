export const MAX_CHAT_BODY_BYTES = 64 * 1024;
export const MAX_CHAT_MESSAGE_LENGTH = 4000;

export async function readChatBody(request) {
  const declaredLength = Number(request.headers.get('content-length'));
  if (declaredLength > MAX_CHAT_BODY_BYTES) return { error: 'request_too_large', status: 413 };
  const reader = request.body?.getReader();
  if (!reader) return { error: 'invalid_json', status: 400 };
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_CHAT_BODY_BYTES) {
        await reader.cancel();
        return { error: 'request_too_large', status: 413 };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { body: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { error: 'invalid_json', status: 400 };
  } finally {
    reader.releaseLock();
  }
}

export function validateChatBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'invalid_messages' };
  const { messages, lang = 'ro' } = body;
  if (!Array.isArray(messages) || !messages.length || messages.length > 50) return { error: 'invalid_messages' };
  if (!['ro', 'en', 'ru'].includes(lang)) return { error: 'invalid_language' };
  if (messages.some(m => !m || !['user', 'assistant'].includes(m.role) ||
    typeof m.content !== 'string' || !m.content.trim() || m.content.length > MAX_CHAT_MESSAGE_LENGTH)) {
    return { error: 'invalid_messages' };
  }
  if (messages.at(-1).role !== 'user') return { error: 'last_message_must_be_user' };
  return { messages: messages.slice(-10), lang };
}

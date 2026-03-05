/**
 * ElevenLabs Text-to-Speech helper.
 * Uses the multilingual v2 model for RO/EN/RU support.
 */

const MAX_TEXT_LENGTH = 2048;

/**
 * Synthesize speech from text via ElevenLabs API.
 *
 * @param {string} text - Text to speak (trimmed to 2048 chars)
 * @param {string} lang - Language code (ro/en/ru) — model auto-detects, but useful for future voice mapping
 * @returns {Promise<Response>} - Raw fetch Response with audio/mpeg body
 */
export async function synthesizeSpeech(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    throw new Error('ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID not set');
  }

  const trimmedText = text.slice(0, MAX_TEXT_LENGTH);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: trimmedText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    const err = new Error(`ElevenLabs error ${res.status}: ${errBody}`);
    err.status = res.status;
    throw err;
  }

  return res;
}

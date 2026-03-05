import { getUser } from '@/lib/auth-helpers';

const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';

// Map app language codes to Whisper ISO-639-1 codes
const LANG_MAP = { ro: 'ro', en: 'en', ru: 'ru' };

export async function POST(request) {
  // Auth + premium check
  const auth = await getUser(request);
  if (!auth) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }
  if (auth.profile?.tier !== 'premium') {
    return new Response(JSON.stringify({ ok: false, error: 'premium_required' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[api] voice/stt: OPENAI_API_KEY not set');
    return new Response(JSON.stringify({ ok: false, error: 'service_unavailable' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const lang = formData.get('lang') || 'ro';

    if (!audioFile) {
      return new Response(JSON.stringify({ ok: false, error: 'audio_required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward to Whisper API
    const whisperForm = new FormData();
    whisperForm.append('file', audioFile, 'recording.webm');
    whisperForm.append('model', 'whisper-1');
    if (LANG_MAP[lang]) whisperForm.append('language', LANG_MAP[lang]);

    const res = await fetch(WHISPER_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: whisperForm,
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error(`[api] voice/stt: Whisper error ${res.status}:`, errBody);
      return new Response(JSON.stringify({ ok: false, error: 'transcription_failed' }), {
        status: 502, headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await res.json();
    console.log(`[api] voice/stt: transcribed ${result.text?.length || 0} chars`);

    return new Response(JSON.stringify({ ok: true, text: result.text || '' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api] voice/stt failed:', err?.message || err);
    return new Response(JSON.stringify({ ok: false, error: 'internal_error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}

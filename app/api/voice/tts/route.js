import { getUser } from '@/lib/auth-helpers';
import { synthesizeSpeech } from '@/lib/elevenlabs';

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

  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(JSON.stringify({ ok: false, error: 'text_required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Strip markdown for cleaner speech
    const cleanText = text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .trim();

    const audioResponse = await synthesizeSpeech(cleanText);

    console.log(`[api] voice/tts: synthesized ${cleanText.length} chars`);

    // Stream audio directly to client
    return new Response(audioResponse.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('[api] voice/tts failed:', err?.message || err);

    if (err.message?.includes('not set')) {
      return new Response(JSON.stringify({ ok: false, error: 'service_unavailable' }), {
        status: 503, headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: 'tts_failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}

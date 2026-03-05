import { applyRateLimit, clientIp } from '@/lib/server-rate-limit';
import { streamWithFallback } from '@/lib/chat-providers';

function getSystemPrompt(lang) {
  if (lang === 'en') {
    return `You are the AI assistant of the adevar.ai platform — Moldova's public data intelligence platform.

Your role:
- Answer questions about Moldova's economy, politics, and public data
- Explain economic indicators (inflation, GDP, exchange rates, energy) in simple language
- Analyze recent news and events from Moldova
- Provide historical context and regional comparisons
- Be objective, data-driven, and transparent when you lack information

Rules:
- Respond ONLY in English
- Be concise — maximum 3 paragraphs unless more is requested
- Cite sources when possible (BNM, BNS, Eurostat)
- Do not invent data — say "I don't have this information" if unsure
- Do not give financial or investment advice
- Format with markdown: **bold**, lists, links

You are a product of adevar.ai, built in Moldova for the citizens of Moldova.`;
  }

  if (lang === 'ru') {
    return `Ты AI-ассистент платформы adevar.ai — платформа разведки публичных данных Республики Молдова.

Твоя роль:
- Отвечать на вопросы об экономике, политике и публичных данных Республики Молдова
- Объяснять экономические показатели (инфляция, ВВП, обменный курс, энергетика) простым языком
- Анализировать последние новости и события из Молдовы
- Предоставлять исторический контекст и региональные сравнения
- Быть объективным, основываться на данных и быть прозрачным при отсутствии информации

Правила:
- Отвечай ТОЛЬКО на русском языке
- Будь кратким — максимум 3 абзаца, если не просят больше
- Ссылайся на источники, когда возможно (BNM, BNS, Eurostat)
- Не выдумывай данные — скажи "У меня нет этой информации", если не знаешь
- Не давай финансовых или инвестиционных советов
- Форматируй с markdown: **жирный**, списки, ссылки

Ты продукт adevar.ai, созданный в Молдове для граждан Молдовы.`;
  }

  // Default: Romanian
  return `Ești asistentul AI al platformei adevar.ai — platforma de inteligență a datelor publice din Republica Moldova.

Rolul tău:
- Răspunzi la întrebări despre economia, politica și datele publice ale Republicii Moldova
- Explici indicatorii economici (inflație, PIB, curs valutar, energie) în limbaj simplu
- Analizezi știrile și evenimentele recente din Moldova
- Oferi context istoric și comparații regionale
- Ești obiectiv, bazat pe date, și transparent când nu ai informații

Reguli:
- Răspunde DOAR în limba în care ți se adresează utilizatorul
- Fii concis — maximum 3 paragrafe dacă nu se cere mai mult
- Citează surse când e posibil (BNM, BNS, Eurostat)
- Nu inventa date — spune "Nu am această informație" dacă nu știi
- Nu da sfaturi financiare sau de investiții
- Formatează cu markdown: **bold**, liste, linkuri

Ești un produs al adevar.ai, construit în Moldova pentru cetățenii Moldovei.`;
}

export async function POST(request) {
  const rl = await applyRateLimit(`chat:${clientIp(request)}`, { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return new Response(JSON.stringify({ ok: false, error: 'rate_limited' }), {
      status: 429, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { messages, lang = 'ro' } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: 'messages_required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = getSystemPrompt(lang);

    // Trim to last 10 messages
    const trimmedMessages = messages.slice(-10);

    // Stream with automatic fallback: Gemini → Groq → Cloudflare
    let result;
    try {
      result = await streamWithFallback(trimmedMessages, systemPrompt);
    } catch (err) {
      if (err.message.startsWith('no_providers_configured')) {
        console.error('[api] chat: no AI providers configured');
        return new Response(JSON.stringify({ ok: false, error: 'service_unavailable' }), {
          status: 503, headers: { 'Content-Type': 'application/json' }
        });
      }
      console.error('[api] chat: all providers failed:', err?.message || err);
      return new Response(JSON.stringify({ ok: false, error: 'all_providers_failed' }), {
        status: 503, headers: { 'Content-Type': 'application/json' }
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const text of result.stream) {
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          console.error(`[api] chat stream error (${result.provider}):`, err?.message || err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'stream_failed' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[api] chat failed:', err?.message || err);
    return new Response(JSON.stringify({ ok: false, error: 'internal_error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

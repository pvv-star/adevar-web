import { applyRateLimit, clientIp } from '@/lib/server-rate-limit';
import { streamWithFallback, streamPremium } from '@/lib/chat-providers';
import { getUser, checkAndIncrementUsage, FREE_DAILY_LIMIT } from '@/lib/auth-helpers';

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
    const trimmedMessages = messages.slice(-10);

    // Check auth — returns null if not authenticated
    const auth = await getUser(request);
    const isPremium = auth?.profile?.tier === 'premium';

    // Usage tracking for free-tier users
    let questionsRemaining = null;

    if (auth && !isPremium) {
      // Authenticated free user: track in profiles table
      const usage = await checkAndIncrementUsage(auth.user.id, auth.profile);
      if (usage.limitReached) {
        return new Response(JSON.stringify({
          ok: false, error: 'daily_limit_reached', limit: FREE_DAILY_LIMIT,
        }), {
          status: 429, headers: { 'Content-Type': 'application/json' }
        });
      }
      questionsRemaining = FREE_DAILY_LIMIT - usage.questionsToday;
    } else if (!auth) {
      // Anonymous user: IP-based daily limit
      const dailyRl = await applyRateLimit(`chat-daily:${clientIp(request)}`, {
        limit: FREE_DAILY_LIMIT,
        windowMs: 24 * 60 * 60 * 1000,
      });
      if (!dailyRl.allowed) {
        return new Response(JSON.stringify({
          ok: false, error: 'daily_limit_reached', limit: FREE_DAILY_LIMIT,
        }), {
          status: 429, headers: { 'Content-Type': 'application/json' }
        });
      }
      questionsRemaining = dailyRl.remaining;
    }
    // Premium users: no limit, questionsRemaining stays null

    // Route to provider based on tier
    let result;
    try {
      if (isPremium) {
        result = await streamPremium(trimmedMessages, systemPrompt);
      } else {
        result = await streamWithFallback(trimmedMessages, systemPrompt);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.startsWith('no_providers_configured') || msg.startsWith('claude_not_configured')) {
        console.error('[api] chat: provider not configured:', msg);
        return new Response(JSON.stringify({ ok: false, error: 'service_unavailable' }), {
          status: 503, headers: { 'Content-Type': 'application/json' }
        });
      }
      console.error('[api] chat: provider failed:', msg);
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

    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Provider': result.provider,
    };
    if (questionsRemaining !== null) {
      headers['X-Questions-Remaining'] = String(questionsRemaining);
    }

    return new Response(stream, { headers });
  } catch (err) {
    console.error('[api] chat failed:', err?.message || err);
    return new Response(JSON.stringify({ ok: false, error: 'internal_error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

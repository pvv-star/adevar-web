import { NextResponse } from 'next/server';
import { getSupabaseReadClient, getSupabaseServerClient } from '@/lib/supabase-server';
import { DATA_GOVERNANCE, notAvailableResponse } from '@/lib/data-governance';
import { boundedInteger } from '@/lib/query-params';
import { applyRateLimit, clientIp } from '@/lib/server-rate-limit';

const VALID_TAGS = ['energie', 'economie', 'social'];

export async function GET(request) {
  try {
    const rl = await applyRateLimit(`news-by-tag:${clientIp(request)}`, { limit: 120, windowMs: 60_000 });
    if (!rl.allowed) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const limit = boundedInteger(searchParams.get('limit'), { fallback: 5, min: 1, max: 20 });

    if (!tag || !VALID_TAGS.includes(tag)) {
      return NextResponse.json({ ok: false, error: 'invalid_tag', items: [] }, { status: 400 });
    }

    const runQuery = (client) =>
      client
        .from('news_items')
        .select('id,title,url,source_slug,published_at,impact_score,summary')
        .contains('tags', [tag])
        .order('published_at', { ascending: false })
        .limit(limit);

    let { data, error } = await runQuery(getSupabaseReadClient());
    if (error || !Array.isArray(data) || data.length === 0) {
      ({ data, error } = await runQuery(getSupabaseServerClient()));
    }
    if (error) throw error;

    const items = (data || []).map((row) => ({
      title: row.title,
      source_name: row.source_slug,
      published_at: row.published_at,
      link: row.url,
      impact_score: row.impact_score ?? 0,
      summary: row.summary ?? null,
    }));

    return NextResponse.json(
      { ok: true, items, tag, ...DATA_GOVERNANCE },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
  } catch (err) {
    console.error('[api] news/by-tag failed:', err?.message || err);
    return NextResponse.json(notAvailableResponse(), { status: 200 });
  }
}

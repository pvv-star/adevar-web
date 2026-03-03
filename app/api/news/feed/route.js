import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { DATA_GOVERNANCE, notAvailableResponse } from '@/lib/data-governance';
import { applyRateLimit, clientIp } from '@/lib/server-rate-limit';

export async function GET(request) {
  const rl = applyRateLimit(`news-feed:${clientIp(request)}`, { limit: 120, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '72h';
    const limit = Math.min(50, Math.max(5, Number(searchParams.get('limit') || 20)));
    const cursor = searchParams.get('cursor');
    const q = (searchParams.get('q') || '').trim();

    const hours = range === '24h' ? 24 : range === '48h' ? 48 : 72;
    const from = new Date(Date.now() - hours * 3600 * 1000).toISOString();

    const client = getSupabaseServerClient();

    let query = client
      .from('news_items')
      .select('id,title,summary,url,source_slug,published_at,impact_score,duplicate_group')
      .gte('published_at', from)
      .order('published_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) query = query.lt('published_at', cursor);
    if (q) query = query.ilike('title', `%${q}%`);

    const { data, error } = await query;

    if (error) throw error;

    // Deduplicate by duplicate_group — keep the first (most recent) item per group
    const seen = new Set();
    const deduped = (data || []).filter(item => {
      const key = item.duplicate_group;
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const hasMore = deduped.length > limit;
    const items = hasMore ? deduped.slice(0, limit) : deduped;
    const nextCursor = hasMore ? items[items.length - 1]?.published_at : null;

    return NextResponse.json({ ok: true, items, nextCursor, hasMore, range, ...DATA_GOVERNANCE }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    console.error('[api] news-feed failed:', err?.message || err);
    return NextResponse.json(notAvailableResponse(), { status: 200 });
  }
}

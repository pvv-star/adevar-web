import { NextResponse } from 'next/server';
import { getSupabaseReadClient, getSupabaseServerClient } from '@/lib/supabase-server';
import { DATA_GOVERNANCE, notAvailableResponse } from '@/lib/data-governance';
import { applyRateLimit, clientIp } from '@/lib/server-rate-limit';

function deduplicateByGroup(rows) {
  const groups = new Map();
  const ungrouped = [];

  for (const row of rows) {
    if (!row.duplicate_group) {
      ungrouped.push(row);
      continue;
    }
    const existing = groups.get(row.duplicate_group);
    if (!existing) {
      groups.set(row.duplicate_group, row);
    } else {
      const existingScore = Number(existing.impact_score || 0);
      const newScore = Number(row.impact_score || 0);
      if (newScore > existingScore || (newScore === existingScore && row.published_at > existing.published_at)) {
        groups.set(row.duplicate_group, row);
      }
    }
  }

  return [...groups.values(), ...ungrouped]
    .sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''));
}

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

    const hours = range === '24h' ? 24 : range === '48h' ? 48 : 72;
    const from = new Date(Date.now() - hours * 3600 * 1000).toISOString();

    // Over-fetch to ensure we have enough unique stories after dedup.
    const fetchLimit = limit * 3;

    const runQuery = (client) => {
      let q = client
        .from('news_items')
        .select('id,title,summary,url,source_slug,published_at,impact_score,tags,duplicate_group')
        .gte('published_at', from)
        .order('published_at', { ascending: false })
        .limit(fetchLimit + 1);

      if (cursor) q = q.lt('published_at', cursor);
      return q;
    };

    let { data, error } = await runQuery(getSupabaseReadClient());

    // Fallback to service-role client when anon/RLS returns errors OR empty sets unexpectedly.
    if (error || !Array.isArray(data) || data.length === 0) {
      ({ data, error } = await runQuery(getSupabaseServerClient()));
    }

    if (error) throw error;

    const rows = data || [];
    const dbHasMore = rows.length > fetchLimit;
    const deduped = deduplicateByGroup(dbHasMore ? rows.slice(0, fetchLimit) : rows);

    const hasMore = deduped.length > limit || dbHasMore;
    const items = deduped.slice(0, limit);
    const nextCursor = items.length ? items[items.length - 1]?.published_at : null;

    return NextResponse.json({ ok: true, items, nextCursor, hasMore, range, ...DATA_GOVERNANCE }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    console.error('[api] news-feed failed:', err?.message || err);
    return NextResponse.json(notAvailableResponse(), { status: 200 });
  }
}

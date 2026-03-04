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
    .sort((a, b) => Number(b.impact_score || 0) - Number(a.impact_score || 0) || (b.published_at || '').localeCompare(a.published_at || ''));
}

export async function GET(request) {
  const rl = applyRateLimit(`live-news:${clientIp(request)}`, { limit: 90, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }
  try {
    const from = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

    // Over-fetch to ensure 5 unique stories after dedup
    const runQuery = (client) => client
      .from('news_items')
      .select('title,url,source_slug,published_at,impact_score,duplicate_group')
      .gte('published_at', from)
      .order('impact_score', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(15);

    let { data, error } = await runQuery(getSupabaseReadClient());
    // Fallback to service-role client when anon/RLS returns errors OR empty sets unexpectedly.
    if (error || !Array.isArray(data) || data.length === 0) {
      ({ data, error } = await runQuery(getSupabaseServerClient()));
    }

    if (error) throw error;

    const items = deduplicateByGroup(data || []).slice(0, 5);

    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString(), items, ...DATA_GOVERNANCE }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } });
  } catch (err) {
    console.error('[api] live-news failed:', err?.message || err);
    return NextResponse.json(notAvailableResponse(), { status: 200, headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60' } });
  }
}

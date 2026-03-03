import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { DATA_GOVERNANCE, notAvailableResponse } from '@/lib/data-governance';
import { applyRateLimit, clientIp } from '@/lib/server-rate-limit';

export async function GET(request) {
  const rl = applyRateLimit(`live-news:${clientIp(request)}`, { limit: 90, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }
  try {
    const from = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

    const { data, error } = await getSupabaseServerClient()
      .from('news_items')
      .select('title,url,source_slug,published_at,impact_score,duplicate_group')
      .gte('published_at', from)
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Deduplicate, then sort by impact score, take top 8
    const seen = new Set();
    const deduped = (data || []).filter(item => {
      const key = item.duplicate_group;
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const items = deduped
      .sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))
      .slice(0, 8);

    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString(), items, ...DATA_GOVERNANCE }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } });
  } catch (err) {
    console.error('[api] live-news failed:', err?.message || err);
    return NextResponse.json(notAvailableResponse(), { status: 200, headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60' } });
  }
}

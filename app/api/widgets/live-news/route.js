import { NextResponse } from 'next/server';
import { getSupabaseReadClient, getSupabaseServerClient } from '@/lib/supabase-server';
import { DATA_GOVERNANCE, notAvailableResponse } from '@/lib/data-governance';
import { applyRateLimit, clientIp } from '@/lib/server-rate-limit';

export async function GET(request) {
  const rl = applyRateLimit(`live-news:${clientIp(request)}`, { limit: 90, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }
  try {
    const from = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

    const runQuery = (client) => client
      .from('news_items')
      .select('title,url,source_slug,published_at,impact_score,duplicate_group')
      .gte('published_at', from)
      .order('impact_score', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(8);

    let { data, error } = await runQuery(getSupabaseReadClient());
    if (error && /permission|rls|denied|42501/i.test(String(error.message || error.code || ''))) {
      ({ data, error } = await runQuery(getSupabaseServerClient()));
    }

    if (error) throw error;

    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString(), items: data || [], ...DATA_GOVERNANCE }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[api] live-news failed:', err?.message || err);
    return NextResponse.json(notAvailableResponse(), { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}

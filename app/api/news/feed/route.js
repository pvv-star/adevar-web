import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { DATA_GOVERNANCE, notAvailableResponse } from '@/lib/data-governance';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '72h';
    const limit = Math.min(50, Math.max(5, Number(searchParams.get('limit') || 20)));
    const cursor = searchParams.get('cursor');

    const hours = range === '24h' ? 24 : range === '48h' ? 48 : 72;
    const from = new Date(Date.now() - hours * 3600 * 1000).toISOString();

    const supabase = getSupabaseServerClient();
    let q = supabase
      .from('news_items')
      .select('id,title,summary,url,source_slug,published_at,impact_score,duplicate_group')
      .gte('published_at', from)
      .order('published_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) q = q.lt('published_at', cursor);

    const { data, error } = await q;
    if (error) throw error;

    const rows = data || [];
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]?.published_at : null;

    return NextResponse.json({ ok: true, items, nextCursor, hasMore, range, ...DATA_GOVERNANCE });
  } catch {
    return NextResponse.json(notAvailableResponse(), { status: 200 });
  }
}

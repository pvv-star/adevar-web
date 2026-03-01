import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const from = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('news_items')
      .select('title,url,source_slug,published_at,impact_score,duplicate_group')
      .gte('published_at', from)
      .order('impact_score', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(8);

    if (error) throw error;

    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString(), items: data || [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || 'live_news_failed' }, { status: 500 });
  }
}

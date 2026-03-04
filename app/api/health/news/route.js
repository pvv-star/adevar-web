import { NextResponse } from 'next/server';
import { getSupabaseReadClient, getSupabaseServerClient } from '@/lib/supabase-server';

const STALE_THRESHOLD_MINUTES = 15;

export async function GET() {
  try {
    const runQuery = (client) => client
      .from('news_runs')
      .select('finished_at,fetched_count,inserted_count')
      .eq('status', 'ok')
      .order('finished_at', { ascending: false })
      .limit(1)
      .single();

    let { data, error } = await runQuery(getSupabaseReadClient());
    if (error || !data) {
      ({ data, error } = await runQuery(getSupabaseServerClient()));
    }
    if (error) throw error;

    const lastRunAt = data.finished_at;
    const minutesAgo = Math.round((Date.now() - new Date(lastRunAt).getTime()) / 60_000);
    const status = minutesAgo > STALE_THRESHOLD_MINUTES ? 'stale' : 'healthy';

    return NextResponse.json({
      status,
      last_run_at: lastRunAt,
      minutes_ago: minutesAgo,
      item_count: data.inserted_count ?? data.fetched_count ?? 0,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (err) {
    console.error('[api] health/news failed:', err?.message || err);
    return NextResponse.json({
      status: 'error',
      last_run_at: null,
      minutes_ago: null,
      item_count: 0,
      error: err?.message || 'unknown',
    }, { status: 500 });
  }
}

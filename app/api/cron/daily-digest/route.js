import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { sendMessage, formatDailyDigest } from '@/lib/telegram';

export const maxDuration = 30;

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) {
    return NextResponse.json({ error: 'TELEGRAM_ADMIN_CHAT_ID not configured' }, { status: 500 });
  }

  const supabase = getSupabaseServerClient();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  // 1. Pipeline health — most recent successful run (ok or partial)
  const { data: lastRun } = await supabase
    .from('news_runs')
    .select('finished_at,fetched_count,inserted_count,error_count,status')
    .in('status', ['ok', 'partial'])
    .order('finished_at', { ascending: false })
    .limit(1)
    .single();

  const health = {};
  if (lastRun?.finished_at) {
    health.minutes_ago = Math.round((Date.now() - new Date(lastRun.finished_at).getTime()) / 60_000);
    health.status = health.minutes_ago > 15 ? 'stale' : 'healthy';
  } else {
    health.minutes_ago = null;
    health.status = 'unknown';
  }

  // 2. Total items ingested in last 24h
  const { data: recentRuns } = await supabase
    .from('news_runs')
    .select('inserted_count')
    .gte('finished_at', since);
  const itemsIngested = (recentRuns || []).reduce((sum, r) => sum + (r.inserted_count || 0), 0);

  // 3. Top 5 news by impact_score in last 24h
  const { data: topNews } = await supabase
    .from('news_items')
    .select('title,source_slug,impact_score')
    .gte('published_at', since)
    .order('impact_score', { ascending: false })
    .limit(5);

  // 4. Errors in last 24h
  const { data: errors } = await supabase
    .from('news_errors')
    .select('source_slug,stage,error')
    .gte('last_seen', since);

  // 5. Indicator changes in last 24h (from data_change_log if available, otherwise skip)
  let indicatorChanges = [];
  const { data: changedIndicators } = await supabase
    .from('data_change_log')
    .select('record_key,payload')
    .eq('action', 'statbank_cron_sync')
    .gte('created_at', since);

  if (changedIndicators?.length) {
    for (const log of changedIndicators) {
      const { data: ind } = await supabase
        .from('indicators')
        .select('id,name,unit')
        .eq('slug', log.record_key)
        .single();
      if (!ind) continue;

      const { data: vals } = await supabase
        .from('indicator_values')
        .select('year,value')
        .eq('indicator_id', ind.id)
        .order('year', { ascending: false })
        .limit(2);
      if (!vals?.length) continue;

      indicatorChanges.push({
        name: ind.name,
        unit: ind.unit || '',
        year: vals[0].year,
        value: Number(vals[0].value),
        oldValue: vals.length > 1 ? Number(vals[1].value) : null,
      });
    }
  }

  // 6. Build problems list
  const problems = [];
  if (health.status === 'stale') {
    problems.push(`Pipeline stale — ultimul run reușit acum ${health.minutes_ago} min`);
  }
  const failedRuns = (recentRuns || []).filter((r) => r.error_count > 0);
  if (failedRuns.length) {
    problems.push(`${failedRuns.length} run(s) cu erori în ultimele 24h`);
  }
  const failedSources = [...new Set((errors || []).filter((e) => e.stage === 'fetch').map((e) => e.source_slug))];
  if (failedSources.length) {
    problems.push(`Surse eșuate: ${failedSources.join(', ')}`);
  }

  const digestData = {
    health,
    itemsIngested,
    topNews: topNews || [],
    errors: errors || [],
    indicatorChanges,
    problems,
  };

  const text = formatDailyDigest(digestData);

  try {
    const result = await sendMessage(adminChatId, text);
    return NextResponse.json({ ok: true, sent: true, messageId: result.result?.message_id });
  } catch (err) {
    console.error('[daily-digest]', err.message);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

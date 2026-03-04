import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { logDataChange } from '@/lib/data-change-log';
import { fetchTable, parseJsonStat2 } from '@/lib/statbank';
import { sendTelegramUpdate } from '@/lib/telegram';

export const maxDuration = 60;

export async function GET(request) {
  // Validate CRON_SECRET
  const authHeader = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const configPath = resolve(process.cwd(), 'data/statbank-indicators.json');
  let indicators;
  try {
    indicators = JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch {
    return NextResponse.json({ error: 'config_not_found' }, { status: 500 });
  }

  const results = { ok: 0, failed: 0, skipped: 0, errors: [] };
  const changes = [];

  for (const config of indicators) {
    try {
      const jsonStat = await fetchTable(config.statbankTable, config.query);
      const series = parseJsonStat2(jsonStat);

      if (series.length === 0) {
        results.skipped += 1;
        continue;
      }

      const { data: indicator, error: indErr } = await supabase
        .from('indicators')
        .upsert(
          [{
            slug: config.slug,
            name: config.name_ro,
            unit: config.unit,
            frequency: config.frequency,
            update_frequency: config.frequency,
            source_name: config.source_name,
            source_url: config.source_url,
            is_official: true,
            coverage_start_year: series[0].year,
            coverage_end_year: series[series.length - 1].year,
          }],
          { onConflict: 'slug' }
        )
        .select('id, slug')
        .single();

      if (indErr) throw new Error(indErr.message);

      // Detect changes: fetch existing values for the latest year
      const latestPoint = series[series.length - 1];
      const { data: existing } = await supabase
        .from('indicator_values')
        .select('value')
        .eq('indicator_id', indicator.id)
        .eq('year', latestPoint.year)
        .maybeSingle();

      const oldValue = existing ? Number(existing.value) : null;
      const newValue = Number(latestPoint.value);
      const changed = oldValue === null || oldValue !== newValue;

      const rows = series.map((s) => ({
        indicator_id: indicator.id,
        year: s.year,
        value: s.value,
      }));

      const { error: valErr } = await supabase
        .from('indicator_values')
        .upsert(rows, { onConflict: 'indicator_id,year' });

      if (valErr) throw new Error(valErr.message);

      if (changed) {
        changes.push({
          name: config.name_ro,
          unit: config.unit || '',
          year: latestPoint.year,
          value: newValue,
          oldValue,
        });
      }

      await logDataChange({
        tableName: 'indicator_values',
        recordKey: config.slug,
        action: 'statbank_cron_sync',
        changedBy: 'cron/sync-statbank',
        reason: `Cron sync from ${config.statbankTable}`,
        payload: { count: series.length, from: series[0].year, to: series[series.length - 1].year },
      });

      results.ok += 1;
    } catch (err) {
      console.error(`[cron] ${config.slug}: ${err.message}`);
      results.failed += 1;
      results.errors.push({ slug: config.slug, error: err.message });
    }
  }

  // Send Telegram notification if any indicators changed
  let telegramSent = false;
  if (changes.length > 0) {
    const tgResult = await sendTelegramUpdate(changes);
    telegramSent = tgResult !== null;
  }

  const status = results.failed > 0 ? 207 : 200;
  return NextResponse.json({ ok: true, ...results, telegramSent, changesDetected: changes.length }, { status });
}

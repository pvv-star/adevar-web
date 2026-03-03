#!/usr/bin/env node

/**
 * Sync StatBank indicators into Supabase.
 *
 * Usage:
 *   node scripts/sync-statbank.mjs            # full sync
 *   node scripts/sync-statbank.mjs --dry-run   # test API + parsing, no DB writes
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { fetchTable, parseJsonStat2 } from '../lib/statbank.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// Load .env.local (same file Next.js reads) without external dependencies
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(resolve(ROOT, '.env.local'));
loadEnvFile(resolve(ROOT, '.env'));

// --- Supabase client (mirrors lib/supabase-server.js for standalone script) ---

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// --- Data change logging (mirrors lib/data-change-log.js) ---

async function logDataChange(supabase, { tableName, recordKey, action, changedBy, reason, payload }) {
  const { error } = await supabase.from('data_change_log').insert({
    table_name: tableName,
    record_key: recordKey || null,
    action,
    changed_by: changedBy || null,
    reason: reason || null,
    payload: payload || null,
  });
  if (error) console.warn(`[log] failed to log change: ${error.message}`);
}

// --- Main sync ---

async function syncIndicator(supabase, config) {
  const { slug, statbankTable, query, name_ro, unit, frequency, source_name, source_url } = config;

  // 1. Fetch from StatBank
  const jsonStat = await fetchTable(statbankTable, query);

  // 2. Parse json-stat2 → [{year, value}]
  const series = parseJsonStat2(jsonStat);
  if (series.length === 0) {
    console.warn(`  ⚠ ${slug}: no data points parsed, skipping`);
    return 'skipped';
  }

  console.log(`  ${slug}: ${series.length} data points (${series[0].year}–${series[series.length - 1].year})`);

  if (DRY_RUN) {
    console.log(`  [dry-run] would upsert indicator "${slug}" with ${series.length} values`);
    return 'dry-run';
  }

  // 3. Upsert indicator metadata
  const { data: indicator, error: indErr } = await supabase
    .from('indicators')
    .upsert(
      [{
        slug,
        name: name_ro,
        unit,
        frequency,
        update_frequency: frequency,
        source_name,
        source_url,
        is_official: true,
        coverage_start_year: series[0].year,
        coverage_end_year: series[series.length - 1].year,
      }],
      { onConflict: 'slug' }
    )
    .select('id, slug')
    .single();

  if (indErr) throw new Error(`indicator upsert failed: ${indErr.message}`);

  // 4. Upsert all values
  const rows = series.map((s) => ({
    indicator_id: indicator.id,
    year: s.year,
    value: s.value,
  }));

  const { error: valErr } = await supabase
    .from('indicator_values')
    .upsert(rows, { onConflict: 'indicator_id,year' });

  if (valErr) throw new Error(`values upsert failed: ${valErr.message}`);

  // 5. Log the change
  await logDataChange(supabase, {
    tableName: 'indicator_values',
    recordKey: slug,
    action: 'statbank_sync',
    changedBy: 'sync-statbank',
    reason: `Automated sync from StatBank table ${statbankTable}`,
    payload: { count: series.length, from: series[0].year, to: series[series.length - 1].year },
  });

  return 'ok';
}

async function main() {
  console.log(`\n🔄 StatBank sync ${DRY_RUN ? '(DRY RUN)' : ''}\n`);

  const configPath = resolve(__dirname, '../data/statbank-indicators.json');
  const indicators = JSON.parse(readFileSync(configPath, 'utf-8'));

  const supabase = DRY_RUN ? null : getSupabase();
  const results = { ok: 0, failed: 0, skipped: 0, 'dry-run': 0 };

  for (const config of indicators) {
    try {
      const status = await syncIndicator(supabase, config);
      results[status] = (results[status] || 0) + 1;
    } catch (err) {
      console.error(`  ✗ ${config.slug}: ${err.message}`);
      results.failed += 1;
    }
  }

  console.log(`\n📊 Summary: ${results.ok} ok, ${results.failed} failed, ${results.skipped} skipped, ${results['dry-run']} dry-run`);
  console.log('');

  if (results.failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exitCode = 1;
});

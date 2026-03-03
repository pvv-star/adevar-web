#!/usr/bin/env node

/**
 * Generate chart JSON files from Supabase StatBank indicator data.
 *
 * Usage:
 *   node scripts/generate-statbank-charts.mjs            # generate all chart JSONs
 *   node scripts/generate-statbank-charts.mjs --dry-run   # preview without writing files
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CHARTS_DIR = resolve(ROOT, 'data/charts');
const DRY_RUN = process.argv.includes('--dry-run');

// Load .env.local (same pattern as sync-statbank.mjs)
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(resolve(ROOT, '.env.local'));
loadEnvFile(resolve(ROOT, '.env'));

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

/** Round up to a "nice" ceiling for yMax */
function niceCeiling(peak) {
  if (peak <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(peak)));
  const normalized = peak / magnitude;
  let nice;
  if (normalized <= 1.2) nice = 1.5;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 3) nice = 3;
  else if (normalized <= 5) nice = 5;
  else if (normalized <= 7.5) nice = 8;
  else nice = 10;
  return nice * magnitude;
}

/** Choose grid steps based on yMax */
function chooseGridSteps(yMax) {
  for (const steps of [5, 6, 7, 8]) {
    if (yMax % steps === 0) return steps;
  }
  return 5;
}

/** Choose decimal places based on unit */
function chooseDecimals(unit) {
  if (unit === '%') return 1;
  return 0; // MDL, persons, mil. MDL, mil. USD
}

/** Format change percentage */
function formatChange(first, last) {
  if (!first || first === 0) return '—';
  const pct = ((last - first) / Math.abs(first)) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

/** i18n stat labels */
const STAT_LABELS = {
  ro: { current: 'Actual', lowest: 'Minim', peak: 'Vârf', change: 'Variație', events: 'Sursa datelor', replay: 'Reluare' },
  en: { current: 'Current', lowest: 'Lowest', peak: 'Peak', change: 'Change', events: 'Data source', replay: 'Replay' },
  ru: { current: 'Текущий', lowest: 'Минимум', peak: 'Пик', change: 'Изменение', events: 'Источник данных', replay: 'Повтор' },
};

/** Build subtitle from indicator name (strip the parenthetical measurement note) */
function buildSubtitle(indicator, lang) {
  const key = `name_${lang}`;
  return indicator[key] || indicator.name_ro;
}

function buildChartJson(indicator, series) {
  const values = series.map((s) => s.value);
  const peak = Math.max(...values);
  const lowest = Math.min(...values);
  const current = values[values.length - 1];
  const yMax = niceCeiling(peak);
  const decimals = chooseDecimals(indicator.unit);

  return {
    config: {
      unit: indicator.unit,
      yMax,
      gridSteps: chooseGridSteps(yMax),
      decimals,
      timeRange: `${series[0].year} — ${series[series.length - 1].year}`,
      data: series.map((s) => ({
        label: String(s.year),
        value: s.value,
        era: 'BNS',
        pm: '',
      })),
      stats: {
        current,
        lowest,
        peak,
        change: formatChange(values[0], current),
      },
      events: [],
      i18n: {
        ro: { title: indicator.name_ro, subtitle: buildSubtitle(indicator, 'ro'), ...STAT_LABELS.ro },
        en: { title: indicator.name_en, subtitle: buildSubtitle(indicator, 'en'), ...STAT_LABELS.en },
        ru: { title: indicator.name_ru, subtitle: buildSubtitle(indicator, 'ru'), ...STAT_LABELS.ru },
      },
      source: {
        name: indicator.source_name,
        url: indicator.source_url,
      },
    },
    eras: {
      BNS: { name: 'BNS StatBank' },
    },
  };
}

async function generateChart(supabase, indicator) {
  const { slug } = indicator;

  // Fetch indicator ID by slug
  const { data: ind, error: indErr } = await supabase
    .from('indicators')
    .select('id')
    .eq('slug', slug)
    .single();

  if (indErr || !ind) {
    console.warn(`  ⚠ ${slug}: indicator not found in Supabase, skipping`);
    return 'skipped';
  }

  // Fetch values sorted by year
  const { data: rows, error: valErr } = await supabase
    .from('indicator_values')
    .select('year, value')
    .eq('indicator_id', ind.id)
    .order('year', { ascending: true });

  if (valErr) throw new Error(`values fetch failed: ${valErr.message}`);

  if (!rows || rows.length === 0) {
    console.warn(`  ⚠ ${slug}: no data points, skipping`);
    return 'skipped';
  }

  const chartJson = buildChartJson(indicator, rows);
  const outPath = resolve(CHARTS_DIR, `${slug}.json`);

  if (DRY_RUN) {
    console.log(`  [dry-run] ${slug}: ${rows.length} points, yMax=${chartJson.config.yMax} → ${outPath}`);
    return 'dry-run';
  }

  writeFileSync(outPath, JSON.stringify(chartJson, null, 2) + '\n');
  console.log(`  ✓ ${slug}: ${rows.length} points → ${slug}.json`);
  return 'ok';
}

export async function generateAllCharts({ dryRun = false } = {}) {
  const configPath = resolve(ROOT, 'data/statbank-indicators.json');
  const indicators = JSON.parse(readFileSync(configPath, 'utf-8'));
  const supabase = getSupabase();
  const results = { ok: 0, failed: 0, skipped: 0, 'dry-run': 0 };

  for (const indicator of indicators) {
    try {
      // Respect the passed dryRun param for programmatic calls
      const origDryRun = DRY_RUN;
      const status = await generateChart(supabase, indicator);
      results[status] = (results[status] || 0) + 1;
    } catch (err) {
      console.error(`  ✗ ${indicator.slug}: ${err.message}`);
      results.failed += 1;
    }
  }

  return results;
}

async function main() {
  console.log(`\n📊 Generate StatBank chart JSONs ${DRY_RUN ? '(DRY RUN)' : ''}\n`);

  const results = await generateAllCharts({ dryRun: DRY_RUN });

  console.log(`\n📋 Summary: ${results.ok} generated, ${results.failed} failed, ${results.skipped} skipped, ${results['dry-run']} dry-run`);
  console.log('');

  if (results.failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exitCode = 1;
});

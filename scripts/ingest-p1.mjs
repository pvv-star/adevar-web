#!/usr/bin/env node
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const manifestPath = new URL('../config/statistica-open-data-manifest.json', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const DRY_RUN = !process.argv.includes('--write');
const p1 = new Set(manifest?.ingestionPhases?.P1 || []);

function readEnvLocal() {
  try {
    const raw = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    const out = {};
    for (const line of raw.split('\n')) {
      const s = line.trim();
      if (!s || s.startsWith('#') || !s.includes('=')) continue;
      const idx = s.indexOf('=');
      const k = s.slice(0, idx).trim();
      const v = s.slice(idx + 1).trim().replace(/^['\"]|['\"]$/g, '');
      out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

const envLocal = readEnvLocal();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || envLocal.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || envLocal.SUPABASE_SERVICE_ROLE_KEY;

function normalizeDataset(cat, ds) {
  return {
    category: cat.id,
    datasetId: ds.id,
    datasetName: ds.name,
    sourceId: ds.sourceId,
    sourceUrl: ds.sourceUrl,
    frequency: ds.frequency,
    geoLevel: ds.geoLevel,
    unitExamples: ds.unitExamples || [],
    owner: ds.owner || null,
    freshnessSlaHours: ds.freshnessSlaHours || null,
    qualityGate: ds.qualityGate || null,
    status: ds.status || 'n/a',
    manifestVersion: manifest.version || 1,
    asOf: new Date().toISOString(),
  };
}

function validateRow(row) {
  const missing = [];
  const required = ['category', 'datasetId', 'sourceId', 'sourceUrl', 'frequency', 'geoLevel', 'owner', 'freshnessSlaHours', 'qualityGate'];
  for (const k of required) if (!row[k]) missing.push(k);
  return missing;
}

const rows = [];
for (const cat of manifest.categories || []) {
  if (!p1.has(cat.id)) continue;
  for (const ds of cat.datasets || []) {
    rows.push(normalizeDataset(cat, ds));
  }
}

let invalid = 0;
for (const row of rows) {
  const missing = validateRow(row);
  if (missing.length) {
    invalid += 1;
    console.error(`INVALID ${row.datasetId}: missing ${missing.join(', ')}`);
  }
}

console.log(`P1 datasets discovered: ${rows.length}`);
console.table(rows.map(r => ({
  category: r.category,
  datasetId: r.datasetId,
  sourceId: r.sourceId,
  frequency: r.frequency,
  owner: r.owner,
  slaH: r.freshnessSlaHours,
  gate: r.qualityGate,
  status: r.status,
})));

if (invalid) {
  console.error(`\nAborted: ${invalid} invalid dataset definitions.`);
  process.exit(1);
}

if (DRY_RUN) {
  console.log('\nDry run complete. No writes performed. Use --write to persist into public.p1_dataset_registry.');
  process.exit(0);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\nMissing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const payload = rows.map((r) => ({
  dataset_id: r.datasetId,
  category: r.category,
  dataset_name: r.datasetName,
  source_id: r.sourceId,
  source_url: r.sourceUrl,
  frequency: r.frequency,
  geo_level: r.geoLevel,
  unit_examples: r.unitExamples,
  owner: r.owner,
  freshness_sla_hours: r.freshnessSlaHours,
  quality_gate: r.qualityGate,
  status: r.status,
  manifest_version: r.manifestVersion,
  as_of: r.asOf,
}));

const { error } = await supabase
  .from('p1_dataset_registry')
  .upsert(payload, { onConflict: 'dataset_id' });

if (error) {
  console.error('\nSupabase upsert failed:', error.message);
  console.error('If table is missing, run migration: sql/migrations/20260302_p1_dataset_registry.sql');
  process.exit(1);
}

console.log(`\nWrite complete: upserted ${payload.length} P1 dataset definitions into public.p1_dataset_registry.`);
process.exit(0);

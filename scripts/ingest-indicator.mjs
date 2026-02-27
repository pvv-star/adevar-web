#!/usr/bin/env node
/**
 * Ingestion skeleton
 * Usage:
 *   node scripts/ingest-indicator.mjs --slug inflation --year 2025 --value 5.2 [--dry-run]
 */

const args = process.argv.slice(2);
const get = (k) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const slug = get('slug');
const year = Number(get('year'));
const value = Number(get('value'));
const dryRun = args.includes('--dry-run');

function fail(msg, code = 1) {
  console.error(`FAIL: ${msg}`);
  process.exit(code);
}

if (!slug || !/^[a-z0-9-_]+$/i.test(slug)) fail('invalid --slug');
if (!Number.isFinite(year) || year < 1990 || year > 2100) fail('invalid --year');
if (!Number.isFinite(value)) fail('invalid --value');

const payload = { slug, year, value };

if (dryRun) {
  console.log(JSON.stringify({ ok: true, mode: 'dry-run', payload }, null, 2));
  process.exit(0);
}

console.log(JSON.stringify({ ok: true, mode: 'skeleton', payload, next: 'wire to secure ingestion API route' }, null, 2));

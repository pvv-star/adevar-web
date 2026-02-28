#!/usr/bin/env node

const base = process.env.ADEVAR_BASE_URL || 'http://localhost:3000';
const args = process.argv.slice(2);
const get = (k) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const payload = {
  slug: get('slug') || 'inflation',
  year: Number(get('year') || new Date().getFullYear()),
  value: Number(get('value') || 0),
  reason: get('reason') || 'manual_update',
  changedBy: get('by') || 'prime',
  dryRun: args.includes('--dry-run'),
};

const url = `${base}/api/ingest/indicator-value`;
const res = await fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(payload),
});

const data = await res.json();
console.log(JSON.stringify({ status: res.status, url, payload, data }, null, 2));

if (!res.ok || !data?.ok) process.exit(1);

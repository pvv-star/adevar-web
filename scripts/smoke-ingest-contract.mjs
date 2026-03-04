#!/usr/bin/env node
const base = process.env.ADEVAR_BASE_URL || 'https://www.adevar.ai';
const url = `${base}/api/ingest/indicator-value`;

const payload = {
  slug: 'inflation',
  year: 2025,
  value: 5.2,
  reason: 'ci_contract_check',
  changedBy: 'ci',
  dryRun: true,
};

const headers = { 'content-type': 'application/json' };
if (process.env.INGEST_API_TOKEN) {
  headers['x-ingest-token'] = process.env.INGEST_API_TOKEN;
}

const res = await fetch(url, {
  method: 'POST',
  headers,
  body: JSON.stringify(payload),
});

const data = await res.json();
console.log(JSON.stringify({ status: res.status, data }, null, 2));

if (!res.ok) process.exit(1);
if (!data?.ok || data?.mode !== 'dry-run') process.exit(2);
if (!data?.target?.indicatorId) process.exit(3);
console.log('OK: ingest contract smoke passed');

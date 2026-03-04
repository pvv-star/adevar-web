#!/usr/bin/env node
const base = process.env.ADEVAR_BASE_URL || 'http://localhost:3000';
const slug = process.argv[2] || 'inflation';
const url = `${base}/api/indicators/${slug}/series?from=2018&to=2025`;

const res = await fetch(url, { cache: 'no-store' });
const data = await res.json();

console.log(JSON.stringify({ ok: res.ok, url, indicator: data?.indicator, count: data?.count }, null, 2));

if (!res.ok) process.exit(1);
if (!data?.indicator) {
  console.error('FAIL: missing indicator metadata');
  process.exit(2);
}

const required = ['name', 'sourceName', 'sourceUrl', 'updateFrequency', 'unit'];
const missing = required.filter((k) => !data.indicator?.[k]);
if (missing.length) {
  console.error(`FAIL: missing metadata keys: ${missing.join(', ')}`);
  process.exit(3);
}

if ((data?.count ?? 0) <= 0) {
  console.error('FAIL: empty series');
  process.exit(4);
}

console.log('OK: indicator metadata smoke passed');

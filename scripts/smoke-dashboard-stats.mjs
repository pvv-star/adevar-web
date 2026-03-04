#!/usr/bin/env node
const base = process.env.ADEVAR_BASE_URL || 'http://localhost:3000';
const url = `${base}/api/dashboard/stats`;

const res = await fetch(url, { cache: 'no-store' });
const data = await res.json();

if (!res.ok) {
  console.error('FAIL', res.status, data);
  process.exit(1);
}

const required = ['gas', 'electricity', 'inflation'];
const missing = required.filter((slug) => !data?.stats?.[slug]);
if (missing.length) {
  console.error(`FAIL: missing dashboard stats: ${missing.join(', ')}`);
  process.exit(2);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      url,
      keys: Object.keys(data.stats || {}),
      sample: {
        gas: data.stats.gas,
        electricity: data.stats.electricity,
        inflation: data.stats.inflation,
      },
    },
    null,
    2
  )
);

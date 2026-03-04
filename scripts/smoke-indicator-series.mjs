#!/usr/bin/env node
const base = process.env.ADEVAR_BASE_URL || 'http://localhost:3000';
const slug = process.argv[2] || 'inflation';
const from = process.argv[3] || '2018';
const to = process.argv[4] || String(new Date().getFullYear());
const url = `${base}/api/indicators/${slug}/series?from=${from}&to=${to}`;

const run = async () => {
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) {
    console.error('FAIL', res.status, data);
    process.exit(1);
  }
  const count = data?.count ?? (Array.isArray(data?.series) ? data.series.length : 0);
  console.log(
    JSON.stringify(
      {
        ok: true,
        url,
        slug: data.slug,
        strategy: data.matchStrategy,
        count,
        first: data.series?.[0] || null,
        last: data.series?.[data.series.length - 1] || null,
      },
      null,
      2
    )
  );

  if (!Array.isArray(data.series) || data.series.length === 0) {
    console.error('FAIL: empty series');
    process.exit(2);
  }
};

run().catch((e) => {
  console.error('FAIL', e.message);
  process.exit(1);
});

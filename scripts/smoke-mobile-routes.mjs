#!/usr/bin/env node

const base = process.env.SMOKE_BASE_URL || 'http://localhost:3100';
const routes = ['/', '/news', '/chart/inflation', '/chart/gas'];
const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

async function check(route) {
  const res = await fetch(`${base}${route}`, {
    headers: {
      'user-agent': ua,
      'accept-language': 'en-US,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`${route} -> ${res.status}`);
  const html = await res.text();
  if (!html.includes('adevar')) throw new Error(`${route} -> missing expected marker`);
  return route;
}

(async () => {
  const bad = [];
  for (const r of routes) {
    try {
      await check(r);
      console.log(`OK ${r}`);
    } catch (e) {
      bad.push(String(e.message || e));
    }
  }

  if (bad.length) {
    console.error('Mobile smoke failed:');
    bad.forEach((b) => console.error(`- ${b}`));
    process.exit(1);
  }

  console.log('OK: mobile route smoke passed');
})();

import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://127.0.0.1:3000';
const routes = ['/', '/news', '/chart/inflation', '/api/news/by-tag?tag=invalid', '/api/news/feed?cursor=invalid'];
const expected = [200, 200, 200, 400, 400];
for (let i = 0; i < routes.length; i++) {
  const response = await fetch(`${base}${routes[i]}`);
  assert.equal(response.status, expected[i], `${routes[i]} status`);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('x-powered-by'), null);
}
for (const route of ['daily-digest', 'news-pipeline', 'sync-statbank', 'telegram-notify']) {
  const response = await fetch(`${base}/api/cron/${route}`);
  assert.equal(response.status, 401, `${route} must reject unauthenticated requests`);
}
const health = await fetch(`${base}/api/health`);
if (health.status === 500) assert.equal((await health.json()).error, 'health-check-failed');
const image = await fetch(`${base}/api/og/inflation`);
assert.equal(image.status, 200, 'chart OG image must render');
assert.match(image.headers.get('content-type'), /image\/png/);
console.log('OK: page routes, API validation, headers, cron authentication, and OG image');

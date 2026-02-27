#!/usr/bin/env node
const base = process.env.ADEVAR_BASE_URL || 'http://localhost:3000';
const url = `${base}/api/health`;

const res = await fetch(url, { cache: 'no-store' });
const contentType = res.headers.get('content-type') || '';
const raw = await res.text();

let data = null;
if (contentType.includes('application/json')) {
  try {
    data = JSON.parse(raw);
  } catch {
    // keep null; handled below
  }
}

if (!data) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        url,
        status: res.status,
        statusText: res.statusText,
        message: 'Expected JSON health response, got non-JSON payload',
        contentType,
        preview: raw.slice(0, 220),
      },
      null,
      2
    )
  );
  process.exit(1);
}

console.log(JSON.stringify({ ok: res.ok, url, data }, null, 2));

if (!res.ok || !data?.ok) {
  process.exit(1);
}

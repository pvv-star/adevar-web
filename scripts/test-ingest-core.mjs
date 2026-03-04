#!/usr/bin/env node
import { validateIngestionPayload } from '../lib/ingestion-validation.js';
import { validateIngestAuth } from '../lib/ingest-auth.js';
import { checkIngestRateLimit } from '../lib/ingest-rate-limit.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// 1) validation success
const valid = validateIngestionPayload({
  slug: 'inflation',
  year: 2025,
  value: 5.2,
  reason: 'test',
  changedBy: 'ci',
});
assert(valid.ok, 'expected valid payload to pass');

// 2) validation fail
const invalid = validateIngestionPayload({ slug: 'bad slug', year: 1800, value: 'x' });
assert(!invalid.ok, 'expected invalid payload to fail');

// 3) auth strict toggle behavior
const reqNoToken = { headers: new Map(), };
reqNoToken.headers.get = (k) => null;

const prevRequired = process.env.INGEST_API_TOKEN_REQUIRED;
const prevToken = process.env.INGEST_API_TOKEN;

process.env.INGEST_API_TOKEN_REQUIRED = 'true';
delete process.env.INGEST_API_TOKEN;
let a = validateIngestAuth(reqNoToken, { dryRun: true });
assert(!a.ok && a.status === 500, 'strict mode should fail without configured token');

process.env.INGEST_API_TOKEN = 'abc123';
a = validateIngestAuth(reqNoToken, { dryRun: true });
assert(!a.ok && a.status === 401, 'configured token should require x-ingest-token');

const reqWithToken = { headers: { get: (k) => (k === 'x-ingest-token' ? 'abc123' : null) } };
a = validateIngestAuth(reqWithToken, { dryRun: true });
assert(a.ok, 'matching token should pass');

// restore env
if (prevRequired === undefined) delete process.env.INGEST_API_TOKEN_REQUIRED; else process.env.INGEST_API_TOKEN_REQUIRED = prevRequired;
if (prevToken === undefined) delete process.env.INGEST_API_TOKEN; else process.env.INGEST_API_TOKEN = prevToken;

// 4) rate limit behavior
const key = 'test-ip';
let blocked = false;
for (let i = 0; i < 35; i++) {
  const r = checkIngestRateLimit(key, { max: 30, windowMs: 60_000 });
  if (!r.allowed) {
    blocked = true;
    break;
  }
}
assert(blocked, 'rate limiter should block after threshold');

console.log('OK: ingest core tests passed');

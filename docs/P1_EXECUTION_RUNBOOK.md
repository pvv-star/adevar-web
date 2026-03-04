# P1 Execution Runbook (Local)

## Scope
P1 categories from `config/statistica-open-data-manifest.json`:
- energy
- economy
- demography
- infrastructure-investments

## Gate 0 — Governance check
Run:
```bash
node scripts/p1-manifest-check.mjs
```
Expected: `P1 manifest check passed.`

## Gate 1 — Ingestion adapter build order
1. BNS StatBank adapter (PxWeb / JSON-stat)
2. BNS communiques parser adapter
3. BNS dissemination calendar adapter

## Gate 2 — Data normalization contract
Each ingested row must map to:
- `indicator_slug`
- `period`
- `value`
- `unit`
- `source_url`
- `as_of`
- `quality_flag`

## Gate 3 — Persistence
Write normalized rows to curated Supabase tables only.

## Gate 4 — Monitoring
P1 strict requirements:
- owner: `data-pipeline`
- freshness SLA: 48h
- alert on delay: 12h
- quality gate: strict

## Next coding task
Implement `scripts/ingest-p1.mjs` that:
1. Loads P1 datasets from manifest
2. Resolves source adapter by `sourceId`
3. Emits normalized rows
4. Validates required fields
5. Writes to Supabase (dry-run mode first)

# Supabase Audit — 2026-03-02

## Summary
- Project linked and CLI-authenticated.
- P1 dataset registry migration applied.
- `public.p1_dataset_registry` populated with 9 P1 rows.
- Database healthy and small (~12 MB), hit rates 1.00/1.00.

## What was executed
1. `supabase link --project-ref wwjnnmorvhychikroleh`
2. `supabase db push` (applied `20260302200500_p1_dataset_registry.sql`)
3. `node scripts/ingest-p1.mjs --write`
4. Verification query confirmed 9 rows in `public.p1_dataset_registry`.

## Current table highlights
- `news_items`: 149 rows
- `news_errors`: 572 rows
- `news_runs`: 142 rows
- `p1_dataset_registry`: 9 rows

## Risks / observations
- Some indexes currently unused (normal at low volume).
- `role-stats` CLI inspect command has a null-scan issue; not DB-impacting.

## Improvements implemented
- Added `sql/diagnostics/health_checks.sql` for routine operational checks.
- Added `scripts/supabase-weekly-audit.sh` for one-command weekly audit.
- Added retention/guardrails migration:
  - `supabase/migrations/20260302201500_ops_retention_and_guardrails.sql`
  - includes 60/90-day purge functions and optional pg_cron scheduling.

## Recommended next actions
- Keep index cleanup deferred until higher traffic.
- Add alerting channel for stale P1 rows (>48h).
- Start implementing source adapters for true P1 ingestion data flow (not just registry).

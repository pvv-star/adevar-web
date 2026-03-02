# Release Candidate Checklist — 2026-03-02 (Local Baseline)

Status: **prepared locally, not deployed in this step**.

## 1) Scope lock (what this RC includes)

### A. UI/UX (local changes)
- [ ] Sidebar compact mode shows category-focused layout (clean, less clutter).
- [ ] Category accordion behavior: opening one category keeps others collapsed.
- [ ] Header selector behavior confirmed (subjects vs categories) per final product decision.
- [ ] Header utility chips placement verified (USD/EUR/weather near search/lang).
- [ ] Category/subject alignment and spacing visually approved on desktop.

### B. Taxonomy + config
- [ ] `config/categories-statistica.json` present and reviewed.
- [ ] Semantic cleanup accepted (merged overlapping buckets).
- [ ] `lib/charts.js` reads category labels/taxonomy from JSON source of truth.

### C. P1 governance + ingestion scaffolding
- [x] `config/statistica-open-data-manifest.json` created.
- [x] P1 governance metadata added (owner/SLA/quality gate/alerts).
- [x] `scripts/p1-manifest-check.mjs` passes.
- [x] `scripts/ingest-p1.mjs --write` successfully upserts P1 registry.
- [x] `public.p1_dataset_registry` row count = 9.

### D. Supabase ops hardening
- [x] Migration applied: `supabase/migrations/20260302201500_ops_retention_and_guardrails.sql`.
- [x] Health checks added: `sql/diagnostics/health_checks.sql`.
- [x] Weekly audit script added: `scripts/supabase-weekly-audit.sh`.
- [x] Audit report added: `docs/SUPABASE_AUDIT_2026-03-02.md`.

---

## 2) Files changed (current working set)

Tracked modified:
- `app/globals.css`
- `components/Dashboard.js`
- `components/Header.js`
- `components/Sidebar.js`
- `lib/charts.js`
- `package.json`
- `package-lock.json`

New/untracked:
- `config/categories-statistica.json`
- `config/statistica-open-data-manifest.json`
- `docs/P1_EXECUTION_RUNBOOK.md`
- `docs/SUPABASE_AUDIT_2026-03-02.md`
- `scripts/ingest-p1.mjs`
- `scripts/p1-manifest-check.mjs`
- `scripts/supabase-weekly-audit.sh`
- `sql/diagnostics/health_checks.sql`
- `sql/migrations/20260302_p1_dataset_registry.sql`
- `supabase/migrations/20260302200500_p1_dataset_registry.sql`
- `supabase/migrations/20260302201500_ops_retention_and_guardrails.sql`

Needs review (possibly accidental/noise):
- `scripts/debug-news-db.sh`

---

## 3) Go/No-Go checks before commit+deploy
- [ ] `npm run preflight` passes on current local tree.
- [ ] Manual smoke on localhost:
  - [ ] `/`
  - [ ] `/chart/gas`
  - [ ] `/chart/electricity`
  - [ ] Header selector final behavior accepted
  - [ ] Sidebar final behavior accepted
- [ ] Confirm deploy path: **single trigger only** (recommended push-only auto deploy).

---

## 4) Proposed commit plan (clean split)
1. **feat(ui):** sidebar/header/taxonomy UX changes
2. **feat(data):** Statistica manifest + P1 scripts
3. **chore(ops):** Supabase migrations + diagnostics + audit docs

---

## 5) Decision needed from VP (tomorrow ship gate)
- Final header selector mode:
  - [ ] subjects (current category’s related charts)
  - [ ] top-level categories
- Final sidebar compact width/alignment:
  - [ ] keep current
  - [ ] nudge right more
- Include all Statistica categories now, or MVP-only first:
  - [ ] all
  - [ ] MVP-only

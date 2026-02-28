# adevar.ai Roadmap (Execution View)

## Phase 1 — Stability (Now)
- [x] Server-side indicator API for inflation
- [x] Smoke checks for indicator endpoint
- [x] DB safety protocol + guardrail migration file
- [ ] Run guardrail migration in production (SQL checkpoint)
- [ ] Finalize env/auth hygiene runbook

## Phase 2 — Product Consistency
- [ ] Apply Brand v4 tokens across global styles
- [ ] Reusable indicator card pattern for dashboard
- [ ] Replace static dashboard stats with API-backed values

## Phase 3 — Data Platform
- [ ] Indicator metadata model (source/frequency/methodology)
- [ ] Ingestion plan per indicator
- [ ] Audit log for data changes

## Phase 4 — Delivery Discipline
- [ ] CI gate for non-empty inflation series
- [ ] Release checklist (DB verify → smoke → deploy → verify)
- [ ] Weekly reliability report

## Current Principle
Prime executes autonomously. User is involved mainly for SQL-layer and auth/access steps.

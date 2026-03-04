# adevar.ai Roadmap (Updated March 2026)

## Phase 1 — Reliable Modular Monolith (Current)

- [x] Next.js app + dashboard + chart routes
- [x] Server indicator API (`/api/indicators/:slug/series`)
- [x] Service-layer retrieval with fallback strategy (join/exact/fuzzy)
- [x] Health endpoint and smoke checks
- [x] Ingestion API with validation/auth and upsert semantics
- [x] Guardrail + metadata/audit SQL migrations added
- [ ] Replace remaining hardcoded dashboard stats with API-derived values
- [ ] Tighten server-key policy (remove anon fallback from server paths)

## Phase 2 — Governance Hardening

- [ ] Finalize indicator registry model (source/frequency/methodology/coverage)
- [ ] Versioning workflow for metadata changes
- [ ] Enforce validation rules per indicator (ranges, frequency, missingness)
- [ ] Expand data change logs into consistent audit trail UI/report export

## Phase 3 — AI Query Layer (Controlled)

- [ ] Design intent schema (`metric`, `timeframe`, `comparison`)
- [ ] Implement safe query builder with table/column allowlist
- [ ] Add `/api/ai-query` with strict guardrails and logs
- [ ] Institutional response formatting with source citation + freshness

## Phase 4 — Delivery Discipline

- [ ] CI checks for non-empty critical indicators (inflation first)
- [ ] Release checklist gate: DB verify → smoke → deploy → verify
- [ ] Reliability dashboard / weekly quality report

## Non-goals (for now)

- Full microservice decomposition
- Real-time streaming architecture
- Complex multi-agent orchestration before data quality is stable

## Working principle

Build for correctness and traceability first.  
Scale architecture only after data reliability and governance are stable.

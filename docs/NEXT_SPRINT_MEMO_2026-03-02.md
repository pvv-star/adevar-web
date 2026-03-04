# Next Sprint Memo — 2026-03-02

## Scope
Memo prepared after stabilization wave ending at commit `d780c1e`.

## Before → After (high level)

### Before
- CI instability from dependency/lockfile drift (Next 14 vs 15 mismatch).
- Repeated Vercel preview noise from `entire/checkpoints/v1` branch.
- News pipeline/feed inconsistencies (healthy API but empty feed cases).
- Mobile/news UX regressions from rapid iteration (sticky overlap, chart/mobile behavior issues).
- Incomplete route-level fault isolation (errors could degrade broader UX context).

### After
- CI stabilized and green on latest main commits.
- Vercel preview noise controlled via ignore rule + checkpoint branch cleanup.
- News feed restored (live widget/feed return items correctly in production).
- Mobile/news UI issues patched and deployed (overlay/sticky/date format fixes).
- Route-level error boundaries added for `news`, `about`, and `chart/[id]`.

---

## What was shipped in this wave
- Lockfile/package alignment for reliable `npm ci` and CI pass.
- Production-safe deploy flow repeatedly validated (`preflight` + safe deploy).
- News API fallback hardening: service client fallback when anon path errors/empties.
- Locale/timezone-aware news timestamps (`ro-MD`, `en-GB`, `ru-MD`, `Europe/Chisinau`).
- News desktop sticky behavior corrected to avoid content blocking.
- Error boundaries introduced at route level for better crash containment.

---

## Current state (at handoff)
- Production health: OK.
- CI: green on latest main.
- News feed: returning data.
- Remaining concerns are mostly architectural, not hotfix-level.

---

## Next Sprint Priorities (recommended)

### P0 — Reliability / Operations
1. **News pipeline observability**
   - Add alerting on consecutive pipeline failures + stale feed windows.
   - Add run summary endpoint/metric for freshness SLA.
2. **Rate limiting architecture**
   - Replace in-memory limiter with Redis-backed shared limiter for multi-instance correctness.
3. **Deploy hygiene lock**
   - Keep branch/build protections to prevent non-product branches from polluting CI/CD.

### P1 — UX / Product Quality
4. **News feed UX polish pass**
   - Validate sticky/search behavior across breakpoints.
   - Verify language parity + date formats in RO/EN/RU.
5. **Chart engine remount refactor (design spike)**
   - Reduce full remount behavior on theme/lang changes to improve responsiveness.
6. **Accessibility deepening**
   - Continue route-level a11y checks, keyboard trap scans, and screen-reader QA scripts.

### P2 — Technical debt / Governance
7. **Single source-of-truth repo workflow**
   - Remove dual-path drift risk (`~/adevar-web` vs `~/.openclaw/workspace/adevar-web`) with one canonical working directory policy.
8. **Codify “before/after release notes”**
   - Keep one short release memo per stabilization wave.

---

## Proposed Sprint Plan (7-day)
- **Day 1:** pipeline alerts + freshness checks + runbook
- **Day 2:** Redis limiter integration plan + PoC
- **Day 3:** news UX regression sweep (desktop/mobile + i18n)
- **Day 4:** chart engine refactor spike + benchmark
- **Day 5:** a11y verification + fixes
- **Day 6:** hardening + full preflight/CI stabilization
- **Day 7:** release, postmortem memo, KPI snapshot

---

## KPI Snapshot to track next sprint
- CI success rate on main
- Production deploy success rate
- News freshness SLA (% checks with non-stale feed)
- Mean time to detect pipeline failure
- Mobile critical-flow pass rate
- Post-release hotfix count

---

## Notes
- Keep this memo as the baseline for next sprint kickoff.
- Update this file with outcomes at sprint close (Before/After v2).

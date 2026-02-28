# Sprint 1 Status — Inflation Data Path Hardening

## Done
- Moved inflation fetch from client-side direct Supabase access to server API route.
- Added service layer (`services/indicators.js`) with resilient lookup strategy:
  - join-by-slug
  - exact indicator-id fallback
  - fuzzy indicator-id fallback
- Added endpoint:
  - `GET /api/indicators/:slug/series?from=&to=`
- Updated dashboard to consume API instead of direct DB calls.
- Verified local production build succeeds.

## Added Diagnostics
- SQL script: `sql/diagnostics/inflation_integrity.sql`
- Purpose: quickly detect linkage issues, orphans, duplicates, and missing years.

## Next
1. Run SQL diagnostics in Supabase and patch data inconsistencies.
2. Replace temporary Inflation Test JSON block with proper chart rendering.
3. Add automated integration test for inflation endpoint non-empty response.

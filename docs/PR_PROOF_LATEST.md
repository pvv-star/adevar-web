# PR Proof (Sprint 4 Hardening)

## Checks
- `npm run check:env` ✅
- `npm run check:migrations` ✅
- `npm run check:docs` ✅
- `npm run test:ingest-core` ✅
- `npm run lint` ✅
- `npm run build` ✅
- `ADEVAR_BASE_URL=https://www.adevar.ai npm run smoke:prod` ✅

## Notes
- ingest route now supports strict token mode + rate limiting
- reject paths are audit-logged
- rollback helper SQL added

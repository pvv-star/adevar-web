# Merge Plan — PR #4

## Path
- `prime/sync-test` -> `develop`
- validate
- `develop` -> `main`

## Required Proofs
- Lint/build green
- Production smoke green
- Inflation API returns non-empty series (2018-2025)

## Rollback
- Revert merge commit on main
- Re-deploy last stable Vercel deployment

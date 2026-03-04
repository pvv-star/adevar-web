# Ingestion Plan

## Workflow
1. Source validation (official URL + methodology)
2. Raw capture (CSV/API/manual extract)
3. Normalize to `{slug, year, value}`
4. Upsert into `indicator_values`
5. Record action in `data_change_log`
6. Run smoke checks

## Mandatory checks
- no duplicate `(indicator_id, year)`
- no missing required metadata on indicator
- range continuity warning for annual series

## First rollout
- inflation (already live)
- gas
- electricity
- salary
- remittances

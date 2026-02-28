# Ingestion API (Sprint 4)

## Endpoint
`POST /api/ingest/indicator-value`

## Payload
```json
{
  "slug": "inflation",
  "year": 2025,
  "value": 5.2,
  "reason": "manual_update",
  "changedBy": "vasily",
  "dryRun": true
}
```

## Behavior
- Validates payload (`slug/year/value/reason/changedBy` required)
- Optional token auth via `x-ingest-token` when `INGEST_API_TOKEN` is configured
- Resolves indicator by slug
- `dryRun=true`: no DB write, returns target preview
- `dryRun=false`: upserts into `indicator_values` and writes `data_change_log`

## Auth
If `INGEST_API_TOKEN` exists in environment, all ingest requests must include:

```http
x-ingest-token: <INGEST_API_TOKEN>
```

## CLI
```bash
# dry-run
ADEVAR_BASE_URL=https://www.adevar.ai \
node scripts/ingest-indicator-api.mjs --slug inflation --year 2025 --value 5.2 --reason test --by prime --dry-run

# write
ADEVAR_BASE_URL=https://www.adevar.ai \
node scripts/ingest-indicator-api.mjs --slug inflation --year 2025 --value 5.2 --reason correction --by prime
```

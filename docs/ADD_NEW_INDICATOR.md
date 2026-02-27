# Add a New Indicator in 5 Steps

1. **Add metadata** in `indicators`:
   - slug, name, source_name, source_url, methodology, update_frequency, unit, coverage years.
2. **Load values** into `indicator_values` (`indicator_id`, `year`, `value`) using UPSERT pattern.
3. **Run checks**:
   - no duplicate `(indicator_id, year)`
   - non-empty series for expected range.
4. **Smoke test API**:
   - `node scripts/smoke-indicator-series.mjs <slug> <from> <to>`
   - `node scripts/smoke-indicator-metadata.mjs <slug>`
5. **Record change**:
   - add note in `data_change_log` (when ingestion write-path is fully wired)
   - update `docs/DATA_CATALOG.md`.

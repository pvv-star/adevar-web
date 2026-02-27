-- Sprint 3: indicator metadata + audit log

-- 1) indicator metadata fields
ALTER TABLE indicators
  ADD COLUMN IF NOT EXISTS source_name text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS methodology text,
  ADD COLUMN IF NOT EXISTS update_frequency text,
  ADD COLUMN IF NOT EXISTS coverage_start_year int,
  ADD COLUMN IF NOT EXISTS coverage_end_year int,
  ADD COLUMN IF NOT EXISTS unit text,
  ADD COLUMN IF NOT EXISTS is_official boolean DEFAULT false;

-- 2) basic audit log for data changes
CREATE TABLE IF NOT EXISTS data_change_log (
  id bigserial PRIMARY KEY,
  table_name text NOT NULL,
  record_key text,
  action text NOT NULL,
  changed_by text,
  reason text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_change_log_table_created
  ON data_change_log (table_name, created_at DESC);

-- 3) seed baseline metadata for inflation if missing
UPDATE indicators
SET
  source_name = COALESCE(source_name, 'Biroul Național de Statistică (BNS)'),
  source_url = COALESCE(source_url, 'https://statistica.gov.md/'),
  methodology = COALESCE(methodology, 'Indicele prețurilor de consum (IPC), anual'),
  update_frequency = COALESCE(update_frequency, 'annual'),
  coverage_start_year = COALESCE(coverage_start_year, 2018),
  coverage_end_year = COALESCE(coverage_end_year, 2025),
  unit = COALESCE(unit, '%'),
  is_official = COALESCE(is_official, true)
WHERE slug = 'inflation';

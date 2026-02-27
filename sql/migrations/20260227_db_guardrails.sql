-- DB Guardrails Migration (safe/idempotent)
-- Apply in Supabase SQL editor on production project.

-- 1) Ensure unique indicator slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'indicators_slug_unique'
      AND conrelid = 'indicators'::regclass
  ) THEN
    ALTER TABLE indicators
      ADD CONSTRAINT indicators_slug_unique UNIQUE (slug);
  END IF;
END$$;

-- 2) Ensure one value per indicator/year
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'indicator_values_indicator_year_unique'
      AND conrelid = 'indicator_values'::regclass
  ) THEN
    ALTER TABLE indicator_values
      ADD CONSTRAINT indicator_values_indicator_year_unique UNIQUE (indicator_id, year);
  END IF;
END$$;

-- 3) Helpful index for series lookups
CREATE INDEX IF NOT EXISTS idx_indicator_values_indicator_year
  ON indicator_values (indicator_id, year);

-- 4) Basic health check
SELECT
  (SELECT COUNT(*) FROM indicators WHERE slug = 'inflation') AS inflation_indicators,
  (SELECT COUNT(*) FROM indicator_values iv JOIN indicators i ON i.id = iv.indicator_id WHERE i.slug = 'inflation') AS inflation_points;

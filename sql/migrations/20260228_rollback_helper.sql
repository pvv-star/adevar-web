-- Rollback helper (manual use): restore/delete latest value for specific slug/year.
-- Use with caution in SQL editor.

-- Example preview
-- SELECT * FROM indicator_values iv
-- JOIN indicators i ON i.id = iv.indicator_id
-- WHERE i.slug = 'inflation' AND iv.year = 2025;

-- Example delete (if needed)
-- DELETE FROM indicator_values
-- WHERE indicator_id = (SELECT id FROM indicators WHERE slug='inflation')
--   AND year = 2025;

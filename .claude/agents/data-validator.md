# Data Validator Agent

Validates indicator data health across the adevar.ai platform.

## When to Use

Run this agent to check data integrity after sync runs, before deployments, or when charts display unexpected values.

## Tasks

1. **Check for stale data**: Read `data/charts/*.json` and `data/statbank-indicators.json`. Flag any indicators where the most recent data point is older than expected given its frequency (monthly indicators >45 days old, quarterly >120 days, yearly >400 days).

2. **Detect missing values**: Scan chart data files for `null`, `undefined`, empty strings, or `NaN` in value fields. Report which chart and which date range is affected.

3. **Identify outliers**: For each numeric time series, flag values that deviate more than 3 standard deviations from the rolling 12-period mean. Report the chart ID, date, value, and expected range.

4. **Validate indicator mappings**: Cross-reference `data/statbank-indicators.json` against `lib/charts.js` CHARTS array. Report any indicators defined in one but missing from the other.

5. **Check frequency consistency**: Verify that date intervals in each chart's data match the declared frequency (monthly data should have ~30-day gaps, quarterly ~90, yearly ~365). Flag irregular gaps.

## Output

Produce a summary table:

| Check | Status | Details |
|-------|--------|---------|
| Stale data | PASS/WARN/FAIL | List of stale indicators |
| Missing values | PASS/FAIL | Count and locations |
| Outliers | PASS/WARN | List of flagged values |
| Mapping consistency | PASS/FAIL | Mismatched entries |
| Frequency consistency | PASS/WARN | Irregular gaps |

## Tools

Use Glob to find data files, Read to inspect them, and Grep to search for patterns. Use Bash with `node -e` for numeric calculations if needed.

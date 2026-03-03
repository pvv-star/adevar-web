// lib/chart-utils.js — Shared chart formatting and normalization utilities

/**
 * Round peak×1.15 up to a clean "nice" ceiling for yMax.
 * Uses a fine step ladder targeting ~15-25% headroom above data peak.
 */
export function niceCeiling(peak) {
  if (peak <= 0) return 10;
  const padded = peak * 1.15;
  const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
  const normalized = padded / magnitude;
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  for (const s of steps) {
    if (s >= normalized) return s * magnitude;
  }
  return 10 * magnitude;
}

/**
 * Pick 4-6 clean grid steps where yMax / steps yields a round number.
 */
export function chooseGridSteps(yMax) {
  for (const steps of [4, 5, 6, 8, 10]) {
    const div = yMax / steps;
    // Float-safe divisibility: check if result is close to an integer
    // or a clean fraction (one decimal place)
    const rounded = Math.round(div * 10) / 10;
    if (Math.abs(div - rounded) < 1e-9) return steps;
  }
  return 5;
}

/**
 * Map unit string to appropriate decimal places.
 */
export function chooseDecimals(unit) {
  if (!unit) return 0;
  const u = unit.toLowerCase();
  if (u === '%') return 1;
  if (u.includes('/kwh') || u.includes('/m³') || u.includes('/usd')) return 2;
  return 0;
}

/**
 * Format a value for Y-axis labels with abbreviation.
 * ≥1B → "1.5B", ≥1M → "150M", ≥10K → "15K", ≥1K → "1.5K"
 */
export function formatYLabel(v, decimals) {
  const abs = Math.abs(v);
  if (abs >= 1e9) return stripTrailingZero((v / 1e9).toFixed(1)) + 'B';
  if (abs >= 1e6) return stripTrailingZero((v / 1e6).toFixed(1)) + 'M';
  if (abs >= 10000) return stripTrailingZero((v / 1e3).toFixed(1)) + 'K';
  if (abs >= 1000) return stripTrailingZero((v / 1e3).toFixed(1)) + 'K';
  if (decimals != null && decimals > 0) {
    const s = v.toFixed(decimals);
    // Strip trailing zeros for cleaner Y-axis labels: "10.00" → "10", "1.50" → "1.5"
    return s.replace(/\.?0+$/, '');
  }
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

function stripTrailingZero(s) {
  return s.replace(/\.0$/, '');
}

/**
 * Format a value for tooltips/stats with full precision and locale thousands separator.
 */
export function formatValue(v, decimals) {
  if (v == null || !Number.isFinite(v)) return '—';
  const d = decimals != null ? decimals : 0;
  // Use fixed decimals then add thousands separators to the integer part
  const fixed = v.toFixed(d);
  const [intPart, decPart] = fixed.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart != null ? withCommas + '.' + decPart : withCommas;
}

/**
 * Recalculate yMax, gridSteps, decimals from chart data.
 * Returns a new config object with updated values, preserving all other fields.
 */
export function normalizeChartConfig(config) {
  if (!config || !config.data || !config.data.length) return config;

  // Find peak across value and value2 (for dual-series charts)
  let peak = -Infinity;
  for (const d of config.data) {
    if (Number.isFinite(d.value) && d.value > peak) peak = d.value;
    if (Number.isFinite(d.value2) && d.value2 > peak) peak = d.value2;
  }

  if (peak <= 0 || !Number.isFinite(peak)) return config;

  const yMax = niceCeiling(peak);
  const gridSteps = chooseGridSteps(yMax);
  const decimals = chooseDecimals(config.unit);

  return {
    ...config,
    yMax,
    gridSteps,
    decimals,
  };
}

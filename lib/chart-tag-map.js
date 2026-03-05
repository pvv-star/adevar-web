// lib/chart-tag-map.js — Explicit slug→tag map for related news on chart pages

const SLUG_TAG_MAP = {
  // energy
  'gas': 'energie',
  'electricity': 'energie',

  // economy
  'inflation': 'economie',
  'salary': 'economie',
  'gdp': 'economie',
  'exchange': 'economie',
  'remittances': 'economie',
  'unemployment': 'economie',
  'statbank-gdp': 'economie',
  'statbank-gdp-growth': 'economie',
  'statbank-industrial-production': 'economie',
  'statbank-salary': 'economie',
  'statbank-exports': 'economie',
  'statbank-imports': 'economie',

  // prices
  'statbank-cpi': 'economie',
  'statbank-cpi-food': 'economie',
  'statbank-cpi-nonfood': 'economie',
  'statbank-cpi-services': 'economie',

  // demography / social
  'births-sex': 'social',
  'population': 'social',
  'statbank-population': 'social',
  'statbank-unemployment': 'social',

  // agriculture
  'statbank-agriculture': 'economie',
};

/**
 * Returns the news tag for a chart slug, or null if no match.
 * @param {string} slug - Chart id (e.g. 'gas', 'inflation')
 * @returns {'energie'|'economie'|'social'|null}
 */
export function getTagForChartSlug(slug) {
  if (!slug || typeof slug !== 'string') return null;
  return SLUG_TAG_MAP[slug] || null;
}

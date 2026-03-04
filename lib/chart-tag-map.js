// lib/chart-tag-map.js — Map chart slugs to news tags for related-news on chart pages

const ENERGY_SLUGS = ['gas', 'electricity', 'heating', 'energy'];
const ECONOMY_SLUGS = ['inflation', 'gdp', 'pib', 'curs', 'exchange', 'salary', 'remittances', 'unemployment', 'statbank'];
const SOCIAL_SLUGS = ['population', 'birth', 'migration', 'pension'];

/**
 * Returns the news tag for a chart slug, or null if no match.
 * Used to fetch related news on chart pages.
 * @param {string} slug - Chart id (e.g. 'gas', 'inflation')
 * @returns {'energie'|'economie'|'social'|null}
 */
export function getTagForChartSlug(slug) {
  if (!slug || typeof slug !== 'string') return null;
  const lower = slug.toLowerCase();

  for (const key of ENERGY_SLUGS) {
    if (lower.includes(key)) return 'energie';
  }
  for (const key of ECONOMY_SLUGS) {
    if (lower.includes(key)) return 'economie';
  }
  for (const key of SOCIAL_SLUGS) {
    if (lower.includes(key)) return 'social';
  }

  return null;
}

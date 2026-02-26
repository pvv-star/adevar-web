import electricityData from '@/data/charts/electricity.json';
import gasData from '@/data/charts/gas.json';
import inflationData from '@/data/charts/inflation.json';

const CHARTS = [
  electricityData,
  gasData,
  inflationData,
];

// Coming soon chart stubs
const COMING_SOON_IDS = [
  'fuel', 'housing', 'wages', 'food',
  'healthcare', 'education', 'transport',
  'gdp', 'exchange', 'unemployment',
];

export function getAllCharts() {
  return CHARTS;
}

export function getAllChartIds() {
  return [...CHARTS.map(c => c.id), ...COMING_SOON_IDS];
}

export function getChartById(id) {
  return CHARTS.find(c => c.id === id) || null;
}

export function isComingSoon(id) {
  return COMING_SOON_IDS.includes(id);
}

export function getChartTitle(chart, lang) {
  switch (lang) {
    case 'en': return chart.titleEn;
    case 'ru': return chart.titleRu;
    default:   return chart.titleRo;
  }
}

export function getChartDescription(chart, lang) {
  switch (lang) {
    case 'en': return chart.descriptionEn;
    case 'ru': return chart.descriptionRu;
    default:   return chart.descriptionRo;
  }
}

import { getActiveCharts, getChartData } from '@/lib/charts';
import { getIndicatorSeriesBySlug } from '@/services/indicators';

function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatValue(value, decimals = 2) {
  if (!Number.isFinite(value)) return null;
  return String(Number(value.toFixed(decimals)));
}

function formatChangePercent(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from === 0) {
    return { change: 'n/a', dir: 'up' };
  }

  const pct = ((to - from) / Math.abs(from)) * 100;
  const sign = pct >= 0 ? '+' : '-';
  const abs = Math.abs(pct);
  const rounded = abs >= 10 ? abs.toFixed(0) : abs.toFixed(1);

  return {
    change: `${sign}${rounded}%`,
    dir: pct >= 0 ? 'up' : 'down',
  };
}

function labelForYear(year) {
  const value = String(year ?? 'n/a');
  return { ro: value, en: value, ru: value };
}

function buildFromApiSeries(chartId, payload) {
  const series = Array.isArray(payload?.series) ? payload.series : [];
  if (!series.length) return null;

  const first = series[0];
  const last = series[series.length - 1];

  const firstValue = toFiniteNumber(first?.value);
  const lastValue = toFiniteNumber(last?.value);
  const decimals = chartId === 'inflation' ? 1 : 2;
  const { change, dir } = formatChangePercent(firstValue, lastValue);

  return {
    value: formatValue(lastValue, decimals),
    unit: payload?.indicator?.unit || (chartId === 'inflation' ? '%' : ''),
    change,
    dir,
    date: labelForYear(last?.year),
    source: 'api',
  };
}

function normalizeQuarterLabel(label = '') {
  const trimmed = String(label).trim();
  return {
    ro: trimmed.replace('Q', 'T'),
    en: trimmed,
    ru: trimmed.replace('Q', 'Кв '),
  };
}

async function buildFromChartJson(chartId) {
  const raw = await getChartData(chartId);
  const config = raw?.config;
  const points = Array.isArray(config?.data) ? config.data : [];
  if (!points.length) return null;

  const first = points[0];
  const last = points[points.length - 1];
  const firstValue = toFiniteNumber(first?.value);
  const lastValue = toFiniteNumber(last?.value);
  const decimals = Number.isFinite(Number(config?.decimals)) ? Number(config.decimals) : 2;

  // Remittances: prefer yearly total USD equivalent widget value (USD + EUR→USD)
  if (chartId === 'remittances' && Array.isArray(config?.yearlyTotals) && config.yearlyTotals.length) {
    const yearly = config.yearlyTotals.slice().sort((a, b) => Number(a.year) - Number(b.year));
    const yf = yearly[0];
    const yl = yearly[yearly.length - 1];
    const from = toFiniteNumber(yf?.totalUsd);
    const to = toFiniteNumber(yl?.totalUsd);
    const computed = formatChangePercent(from, to);
    const yearLabel = String(yl?.year || 'n/a');

    return {
      value: formatValue(to, 1),
      unit: 'mln USD (eq)',
      change: computed.change,
      dir: computed.dir,
      date: { ro: yearLabel, en: yearLabel, ru: yearLabel },
      source: 'json',
    };
  }

  const computed = formatChangePercent(firstValue, lastValue);
  const date = normalizeQuarterLabel(last?.label || 'n/a');

  return {
    value: formatValue(lastValue, decimals),
    unit: config?.unit || '',
    change: computed.change,
    dir: computed.dir,
    date,
    source: 'json',
  };
}

export async function getDashboardStats() {
  const charts = getActiveCharts();
  const stats = {};

  for (const chart of charts) {
    const slug = chart.id;

    try {
      const payload = await getIndicatorSeriesBySlug(slug, { from: 2018 });
      const apiStat = buildFromApiSeries(slug, payload);
      if (apiStat) {
        stats[slug] = apiStat;
        continue;
      }
    } catch {
      // fallback to JSON below
    }

    const jsonStat = await buildFromChartJson(slug);
    if (jsonStat) {
      stats[slug] = jsonStat;
    }
  }

  return {
    updatedAt: new Date().toISOString(),
    stats,
  };
}

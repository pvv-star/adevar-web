import { getChartById, getChartData } from '@/lib/charts';
import ChartPageClient from './ChartPageClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

const BASE = 'https://www.adevar.ai';

export async function generateStaticParams() {
  // Include all charts (active + soon) for SSG
  const { CHARTS } = await import('@/lib/charts');
  return CHARTS
    .filter(c => !c.special)
    .map(c => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const chart = getChartById(id);
  if (!chart) {
    return { title: 'adevar.ai' };
  }
  const title = `${chart.ro} — adevar.ai`;
  const description = chart.desc?.ro || chart.desc?.en || '';
  const chartUrl = `${BASE}/chart/${id}`;
  const ogImage = `${BASE}/api/og/${id}`;
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: chartUrl,
      languages: {
        ro: `${chartUrl}?lang=ro`,
        en: `${chartUrl}?lang=en`,
        ru: `${chartUrl}?lang=ru`,
      },
    },
    openGraph: {
      title,
      description,
      url: chartUrl,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: chart.ro }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

function buildDatasetJsonLd(chart, chartData) {
  const chartUrl = `${BASE}/chart/${chart.id}`;
  const config = chartData?.config;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: chart.en || chart.ro,
    description: chart.desc?.en || chart.desc?.ro || '',
    url: chartUrl,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: {
      '@type': 'Organization',
      name: 'National Bureau of Statistics of the Republic of Moldova',
      url: 'https://statistica.gov.md',
    },
  };

  if (config?.timeRange) {
    // timeRange is like "2014 — 2024", convert to ISO 8601 interval
    const cleaned = config.timeRange.replace(/\s*[—–-]\s*/g, '/');
    jsonLd.temporalCoverage = cleaned;
  }

  if (config?.unit) {
    jsonLd.variableMeasured = config.unit;
  }

  if (config?.source?.url) {
    jsonLd.distribution = {
      '@type': 'DataDownload',
      contentUrl: config.source.url,
      encodingFormat: 'application/json',
    };
  }

  // Extract dateModified from the last data point label or fall back to build date
  const datasets = chartData?.datasets || chartData?.data?.datasets;
  const lastLabel = chartData?.labels?.at?.(-1) || chartData?.data?.labels?.at?.(-1);
  if (lastLabel) {
    // Labels may be "2024", "2024-06", "Jun 2024", etc. — use as-is for dateModified
    const parsed = new Date(lastLabel);
    if (!isNaN(parsed)) {
      jsonLd.dateModified = parsed.toISOString().split('T')[0];
    }
  }

  return jsonLd;
}

function buildBreadcrumbJsonLd(chart) {
  const chartUrl = `${BASE}/chart/${chart.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: chart.en || chart.ro, item: chartUrl },
    ],
  };
}

export default async function ChartPage({ params }) {
  const { id } = await params;
  const chart = getChartById(id);
  if (!chart) notFound();

  // For coming-soon charts, pass null data
  const chartData = chart.soon ? null : await getChartData(id);

  const datasetJsonLd = chartData ? buildDatasetJsonLd(chart, chartData) : null;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(chart);

  return (
    <>
      {datasetJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ChartPageClient
        chart={chart}
        chartData={chartData}
      />
    </>
  );
}

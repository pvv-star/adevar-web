import { getChartById, getChartData, CHART_DESCS } from '@/lib/charts';
import ChartPageClient from './ChartPageClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

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
  const descObj = CHART_DESCS[chart.id];
  const description = descObj?.ro || descObj?.en || '';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
  };
}

export default async function ChartPage({ params }) {
  const { id } = await params;
  const chart = getChartById(id);
  if (!chart) notFound();

  // For coming-soon charts, pass null data
  const chartData = chart.soon ? null : await getChartData(id);

  return (
    <ChartPageClient
      chart={chart}
      chartData={chartData}
    />
  );
}

import { getChartById, getChartData } from '@/lib/charts';
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
  const chart = getChartById(params.id);
  if (!chart) {
    return { title: 'adevar.ai' };
  }
  const title = `${chart.ro} — adevar.ai`;
  const description = chart.desc?.ro || chart.desc?.en || '';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: 'https://adevar.ai/og-image.png' }],
    },
  };
}

export default async function ChartPage({ params }) {
  const chart = getChartById(params.id);
  if (!chart) notFound();

  // For coming-soon charts, pass null data
  const chartData = chart.soon ? null : await getChartData(params.id);

  return (
    <ChartPageClient
      chart={chart}
      chartData={chartData}
    />
  );
}

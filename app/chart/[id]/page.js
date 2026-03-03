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
  const { id } = await params;
  const chart = getChartById(id);
  if (!chart) {
    return { title: 'adevar.ai' };
  }
  const title = `${chart.ro} — adevar.ai`;
  const description = chart.desc?.ro || chart.desc?.en || '';
  const chartUrl = `https://www.adevar.ai/chart/${id}`;
  const ogImage = `https://www.adevar.ai/api/og/${id}`;
  return {
    title,
    description,
    alternates: { canonical: chartUrl },
    openGraph: {
      title,
      description,
      url: chartUrl,
      type: 'article',
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

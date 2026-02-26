import { getChartById, getAllChartIds } from '@/lib/charts';
import ChartPageClient from './ChartPageClient';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const ids = getAllChartIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const chart = getChartById(id);
  if (!chart) return { title: 'Chart Not Found' };
  return {
    title: `${chart.titleRo} | Adevăr.md`,
    description: chart.descriptionRo,
  };
}

export default async function ChartPage({ params }) {
  const { id } = await params;
  const chart = getChartById(id);
  if (!chart) notFound();

  return <ChartPageClient chartId={id} initialData={chart} />;
}

import { getAllChartIds, getChart } from '../../../lib/charts';
import ChartPageClient from './ChartPageClient';

export async function generateStaticParams() {
  const ids = getAllChartIds();
  return ids.map(id => ({ id }));
}

export async function generateMetadata({ params }) {
  const chart = getChart(params.id);
  if (!chart) return { title: 'Chart | Adevăr.md' };
  return {
    title: `${chart.config.titleRo || chart.id} | Adevăr.md`,
    description: chart.config.descRo || ''
  };
}

export default function ChartPage({ params }) {
  return <ChartPageClient id={params.id} />;
}

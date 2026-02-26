'use client';
import { useTranslation } from '@/contexts/LangContext';
import ChartCanvas from '@/components/ChartCanvas';

export default function ChartPageClient({ chartId, initialData }) {
  const { t, lang } = useTranslation();
  const chart = initialData;

  const title = lang === 'ro' ? chart.titleRo
    : lang === 'en' ? chart.titleEn
    : chart.titleRu;

  const description = lang === 'ro' ? chart.descriptionRo
    : lang === 'en' ? chart.descriptionEn
    : chart.descriptionRu;

  return (
    <div className="chart-page">
      <div className="page-header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="chart-full-wrap">
        <ChartCanvas chartId={chartId} data={chart.data} height={420} />
      </div>
    </div>
  );
}

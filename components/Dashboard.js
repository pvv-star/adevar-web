'use client';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LangContext';
import { getAllCharts } from '@/lib/charts';
import ChartCanvas from './ChartCanvas';
import StatsBar from './StatsBar';

export default function Dashboard() {
  const { t, lang } = useTranslation();
  const charts = getAllCharts();

  return (
    <div>
      <div className="page-header">
        <h1>{t('dashboard_title')}</h1>
        <p>{t('dashboard_subtitle')}</p>
      </div>

      <StatsBar />

      <div className="chart-grid">
        {charts.map((chart) => {
          const title = lang === 'ro' ? chart.titleRo
            : lang === 'en' ? chart.titleEn
            : chart.titleRu;
          const lastVal = chart.data[chart.data.length - 1]?.value;
          const prevVal = chart.data[chart.data.length - 2]?.value;
          const delta = lastVal && prevVal ? ((lastVal - prevVal) / prevVal * 100).toFixed(1) : null;

          return (
            <Link key={chart.id} href={`/chart/${chart.id}`} style={{ textDecoration: 'none' }}>
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">{title}</div>
                    <div className="chart-card-meta">{chart.source} · {chart.unit}</div>
                  </div>
                  {delta && (
                    <span className={`chart-card-tag ${parseFloat(delta) > 0 ? 'delta-up' : 'delta-down'}`}>
                      {parseFloat(delta) > 0 ? '+' : ''}{delta}%
                    </span>
                  )}
                </div>
                <ChartCanvas chartId={chart.id} data={chart.data} height={180} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

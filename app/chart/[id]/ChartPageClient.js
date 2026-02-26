'use client';

import { useContext } from 'react';
import { LangContext } from '../../../contexts/LangContext';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { getChart } from '../../../lib/charts';
import ChartCanvas from '../../../components/ChartCanvas';
import StatsBar from '../../../components/StatsBar';

export default function ChartPageClient({ id }) {
  const { lang, t } = useContext(LangContext);
  const { theme } = useContext(ThemeContext);
  const chart = getChart(id);

  if (!chart) {
    return <div style={{padding: '2rem', color: 'var(--text)'}}>{t('chartNotFound') || 'Chart not found'}</div>;
  }

  return (
    <div className="chart-page">
      <StatsBar chart={chart} lang={lang} t={t} />
      <ChartCanvas chart={chart} lang={lang} theme={theme} />
    </div>
  );
}

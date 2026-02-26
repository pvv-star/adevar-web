'use client';
import { useLang } from '@/contexts/LangContext';
import { LIVE_STATS } from '@/lib/charts';

export default function StatsBar({ chartId }) {
  const { lang, t } = useLang();
  const stat = LIVE_STATS[chartId];
  if (!stat) return null;

  return (
    <div style={{ padding: '8px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', gap: '16px' }}>
      <span>{t('currentTariff')}: <strong style={{ color: 'var(--text-primary)' }}>{stat.value} {stat.unit}</strong></span>
      <span>{t('lastUpdate')}: {stat.date[lang] || stat.date.en}</span>
    </div>
  );
}

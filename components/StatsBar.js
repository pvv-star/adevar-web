'use client';
import { useTranslation } from '@/contexts/LangContext';

export default function StatsBar() {
  const { t } = useTranslation();
  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-label">{t('stat_inflation')}</div>
        <div className="stat-value">7.2%</div>
        <div className="stat-delta delta-up">+0.4pp {t('vs_prev_quarter')}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">{t('stat_electricity')}</div>
        <div className="stat-value">3.45</div>
        <div className="stat-delta delta-up">+0.24 {t('vs_prev')}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">{t('stat_gas')}</div>
        <div className="stat-value">13.90</div>
        <div className="stat-delta delta-down">-0.50 {t('vs_prev')}</div>
      </div>
    </div>
  );
}

'use client';
import { useLang } from '@/contexts/LangContext';

export default function ComingSoon({ chart }) {
  const { lang, t } = useLang();
  const label = chart[lang] || chart.en;
  const desc = chart.desc ? (chart.desc[lang] || chart.desc.en) : '';

  const notifyMsg = {
    ro: 'Funcție în dezvoltare — vă vom notifica.',
    en: 'Feature in development — we will notify you.',
    ru: 'Функция в разработке — мы уведомим вас.',
  };

  return (
    <div className="page-scroll">
      <div className="inst-card" style={{ maxWidth: '600px' }}>
        <div className="teaser-icon">{chart.icon}</div>
        <div className="teaser-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {t('plannedBadge')}
        </div>
        <div className="teaser-title">{label}</div>
        {desc && <div className="teaser-desc">{desc}</div>}
        <button
          className="teaser-notify-btn"
          type="button"
          onClick={() => alert(notifyMsg[lang] || notifyMsg.en)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {t('notifyMe')}
        </button>
      </div>
    </div>
  );
}

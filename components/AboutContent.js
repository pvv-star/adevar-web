'use client';
import { useLang } from '@/contexts/LangContext';

export default function AboutContent() {
  const { lang, t } = useLang();

  const sources = {
    BNS: {
      name: t('sourcesBNSName'),
      desc: t('sourcesBNSDesc'),
    },
    ANRE: {
      name: t('sourcesANREName'),
      desc: t('sourcesANREDesc'),
    },
    BNM: {
      name: t('sourcesBNMName'),
      desc: t('sourcesBNMDesc'),
    },
  };

  return (
    <div className="page-scroll">
      <div className="view-heading">{t('aboutTitle')}</div>
      <div className="view-subheading">{t('aboutSub')}</div>

      <div className="inst-card about-section">
        <div className="inst-card-title">{t('missionTitle')}</div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          {t('missionText')}
        </p>
      </div>

      <div className="inst-card about-section">
        <div className="inst-card-title">{t('sourcesTitle')}</div>
        <ul className="about-source-list">
          {Object.entries(sources).map(([code, info], i, arr) => (
            <li key={code}>
              <div className="about-source-item">
                <span className="about-source-code">{code}</span>
                <span className="about-source-name">{info.name}</span>
                <span className="about-source-desc">{info.desc}</span>
              </div>
              {i < arr.length - 1 && <div className="about-divider"></div>}
            </li>
          ))}
        </ul>
      </div>

      <div className="inst-card about-section">
        <div className="inst-card-title">{t('methodTitle')}</div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          {t('methodText')}
        </p>
      </div>

      <div className="inst-card about-section">
        <div className="inst-card-title">{t('contactTitle')}</div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          {t('contactText')}
        </p>
      </div>
    </div>
  );
}

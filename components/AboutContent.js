'use client';
import { useLang } from '@/contexts/LangContext';

const SOURCE_URLS = {
  BNS: 'https://statistica.gov.md',
  ANRE: 'https://anre.md',
  BNM: 'https://bnm.md',
};

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
      <h1 className="view-heading">{t('aboutTitle')}</h1>
      <p className="view-subheading">{t('aboutSub')}</p>

      <div className="inst-card about-section">
        <h2 className="inst-card-title">{t('missionTitle')}</h2>
        <p className="about-text">
          {t('missionText')}
        </p>
      </div>

      <div className="inst-card about-section">
        <h2 className="inst-card-title">{t('sourcesTitle')}</h2>
        <ul className="about-source-list" role="list">
          {Object.entries(sources).map(([code, info], i, arr) => (
            <li key={code}>
              <div className="about-source-item">
                <span className="about-source-code">{code}</span>
                <a
                  href={SOURCE_URLS[code]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-source-name about-source-link"
                >
                  {info.name}
                </a>
                <span className="about-source-desc">{info.desc}</span>
              </div>
              {i < arr.length - 1 && <div className="about-divider"></div>}
            </li>
          ))}
        </ul>
      </div>

      <div className="inst-card about-section">
        <h2 className="inst-card-title">{t('methodTitle')}</h2>
        <p className="about-text">
          {t('methodText')}
        </p>
      </div>

      <div className="inst-card about-section">
        <h2 className="inst-card-title">{t('contactTitle')}</h2>
        <p className="about-text">
          {t('contactText')}{' '}
          <a href="mailto:contact@adevar.ai" className="about-contact-link">
            contact@adevar.ai
          </a>
        </p>
      </div>
    </div>
  );
}

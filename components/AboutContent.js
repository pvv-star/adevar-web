'use client';
import { useTranslation } from '@/contexts/LangContext';

export default function AboutContent() {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      <h1>{t('about_title')}</h1>
      <p className="lead">{t('about_lead')}</p>

      <div className="about-section">
        <h2>{t('about_mission_title')}</h2>
        <p>{t('about_mission_body')}</p>
      </div>

      <div className="about-section">
        <h2>{t('about_data_title')}</h2>
        <p>{t('about_data_body')}</p>
        <ul>
          <li>ANRE Moldova – {t('about_source_anre')}</li>
          <li>BNS Moldova – {t('about_source_bns')}</li>
          <li>BNM Moldova – {t('about_source_bnm')}</li>
        </ul>
      </div>

      <div className="about-section">
        <h2>{t('about_team_title')}</h2>
        <div className="team-grid">
          <div className="team-card">
            <h3>Echipa Adevăr.md</h3>
            <p>{t('about_team_body')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useTranslation } from '@/contexts/LangContext';
import Link from 'next/link';

export default function ComingSoon({ chartId }) {
  const { t } = useTranslation();

  return (
    <div className="coming-soon-page">
      <div className="coming-soon-icon">🚧</div>
      <h2>{t('coming_soon_title')}</h2>
      <p>{t('coming_soon_body')}</p>
      <Link href="/dashboard" className="btn btn-primary">
        {t('back_to_dashboard')}
      </Link>
    </div>
  );
}

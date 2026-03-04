'use client';

import { useLang } from '@/contexts/LangContext';

export default function ChartError({ reset }) {
  const { t } = useLang();

  return (
    <div className="page-scroll">
      <div className="view-heading">{t('errorTitle')}</div>
      <div className="view-subheading">{t('errorSub')}</div>
      <button className="ctrl-btn" type="button" aria-label="Retry" onClick={() => reset()}>{t('errorRetry')}</button>
    </div>
  );
}

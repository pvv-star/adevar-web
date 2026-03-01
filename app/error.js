'use client';

import { useEffect } from 'react';
import { useLang } from '@/contexts/LangContext';

export default function Error({ reset }) {
  const { t } = useLang();

  useEffect(() => {
    // no-op: avoid leaking internals in production UI
  }, []);

  return (
    <div className="page-scroll">
      <div className="view-heading">{t('errorTitle')}</div>
      <div className="view-subheading">{t('errorSub')}</div>
      <button className="ctrl-btn" onClick={() => reset()}>{t('errorRetry')}</button>
    </div>
  );
}

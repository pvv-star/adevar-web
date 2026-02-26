'use client';
import { useTranslation, useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <h1 className="header-title">{t('site_name')}</h1>
      <div className="header-actions">
        {['ro', 'en', 'ru'].map((l) => (
          <button
            key={l}
            className={`lang-btn ${lang === l ? 'active' : ''}`}
            onClick={() => setLang(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
        <button className="btn btn-ghost" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

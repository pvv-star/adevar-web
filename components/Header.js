'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LangContext';
import { fetchLiveSnapshot } from '@/lib/live-snapshot-cache';
import SearchModal from './SearchModal';


export default function Header({ onNavToggle }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const canGoBack = pathname && pathname !== '/';
  const [liveMini, setLiveMini] = useState({ usd: null, eur: null, temp: null });

  useEffect(() => {
    let active = true;

    async function fetchLiveMini() {
      try {
        const payload = await fetchLiveSnapshot();
        if (!active || !payload) return;
        setLiveMini({
          usd: payload?.fx?.rates?.USD ?? null,
          eur: payload?.fx?.rates?.EUR ?? null,
          temp: payload?.weather?.temperatureC ?? null,
        });
      } catch {
        // silent in header
      }
    }

    fetchLiveMini();
    const id = setInterval(fetchLiveMini, 60_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Cmd/Ctrl+K to open search
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function onBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  return (
    <>
    <header className="header">
      <div className="header-left">
        <button className="nav-toggle" onClick={onNavToggle} aria-label="Toggle navigation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="15" y2="12"/>
            <line x1="3" y1="18" x2="18" y2="18"/>
          </svg>
        </button>
        {canGoBack ? (
          <button className="back-btn" onClick={onBack} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>{t('back')}</span>
          </button>
        ) : null}
        <Link className="brand" href="/">
          <span className="brand-name">adevar</span>
          <span className="brand-dot">.</span>
          <span className="brand-ext">ai</span>
        </Link>
        <div className="live-mini-group" aria-label="Live rates and weather">
          <span className="live-mini-chip">USD {liveMini.usd ?? '—'}</span>
          <span className="live-mini-chip">EUR {liveMini.eur ?? '—'}</span>
          <span className="live-mini-chip">{liveMini.temp ?? '—'}°C</span>
        </div>
      </div>
      <div className="header-right">
        <button className="search-toggle" onClick={() => setSearchOpen(true)} aria-label={t('searchIndicators')} title="⌘K">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <div className="lang-group" role="group" aria-label="Language">
          {['ro','en','ru'].map(l => (
            <button
              key={l}
              className={`lang-btn${lang === l ? ' active' : ''}`}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
    <SearchModal open={searchOpen} onClose={closeSearch} />
    </>
  );
}

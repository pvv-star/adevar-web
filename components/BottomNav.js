'use client';
import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LangContext';
import { getChartById } from '@/lib/charts';
import Link from 'next/link';

function icon(name, filled = false) {
  switch (name) {
    case 'home':
      return filled ? (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3 3 10.5V21h6.5v-6.2h5V21H21V10.5L12 3Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.8V21h14V9.8" />
          <path d="M9.5 21v-6.2h5V21" />
        </svg>
      );
    case 'news':
      return filled ? (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 4h13a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H7a3 3 0 0 1-3-3V4Zm4 4h8v2H8V8Zm0 4h8v2H8v-2Zm0 4h5v2H8v-2Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 5h13a3 3 0 0 1 3 3v10a2 2 0 0 1-2 2H7a3 3 0 0 1-3-3V5Z" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );
    case 'data':
      return filled ? (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M5 19h14v2H5zM6 10h3v8H6zM11 6h3v12h-3zM16 12h3v6h-3z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 20h14" />
          <path d="M7.5 10v8M12 6v12M16.5 12v6" />
        </svg>
      );
    default:
      return filled ? (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="6" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="18" cy="12" r="2" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="6" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" />
        </svg>
      );
  }
}

const MORE_LINKS = [
  { href: '/chart/gas', label: 'Energy' },
  { href: '/chart/inflation', label: 'Economy' },
  { href: '/chart/births-sex', label: 'Demography' },
  { href: '/chart/internet', label: 'Infrastructure' },
  { href: '/about', label: 'Platform' },
];

export default function BottomNav() {
  const { t } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const chartMatch = pathname.match(/^\/chart\/([^/]+)/);
  const chartId = chartMatch?.[1] || null;
  const chart = chartId ? getChartById(chartId) : null;

  const isNews = pathname.startsWith('/news');
  const isData = pathname.startsWith('/chart');
  const dataLabel = useMemo(() => {
    if (!chart) return 'Data';
    return chart?.en || 'Data';
  }, [chart]);

  const tabs = [
    { id: 'home', label: t('bnTabDashboard') || 'Home', iconName: 'home', href: '/', active: pathname === '/' },
    { id: 'news', label: 'News', iconName: 'news', href: '/news?range=72h', active: isNews },
    { id: 'data', label: 'Charts', iconName: 'data', href: '/chart/inflation', active: isData },
  ];

  function onActiveTap(e, href) {
    if (pathname === href || (href.startsWith('/chart') && pathname.startsWith('/chart'))) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      router.refresh();
    }
  }

  function openMoreSheet() {
    setMoreOpen(true);
    document.body.style.overflow = 'hidden';
  }

  function closeMoreSheet() {
    setMoreOpen(false);
    document.body.style.overflow = '';
  }

  return (
    <>
      <nav className="bottom-nav" role="tablist" aria-label="Mobile navigation">
        <div className="bottom-nav-inner">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              role="tab"
              aria-selected={tab.active ? 'true' : 'false'}
              aria-label={tab.label}
              className={`bn-tab${tab.active ? ' active' : ''}`}
              onClick={(e) => tab.active && onActiveTap(e, tab.href)}
            >
              {icon(tab.iconName, tab.active)}
              <span className="bn-tab-label" title={tab.id === 'data' && chart ? dataLabel : tab.label}>
                {tab.id === 'data' && chart ? 'Charts' : tab.label}
              </span>
            </Link>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={moreOpen ? 'true' : 'false'}
            aria-label={t('bnTabMore') || 'More'}
            className={`bn-tab${moreOpen ? ' active' : ''}`}
            onClick={openMoreSheet}
          >
            {icon('more', moreOpen)}
            <span className="bn-tab-label">{t('bnTabMore') || 'More'}</span>
          </button>
        </div>
      </nav>

      {moreOpen ? <button type="button" className="more-sheet-backdrop" onClick={closeMoreSheet} aria-label="Close menu" /> : null}
      <aside className={`more-sheet${moreOpen ? ' open' : ''}`} aria-hidden={!moreOpen}>
        <div className="more-sheet-handle" />
        <div className="more-sheet-title">Quick destinations</div>
        <div className="more-sheet-list">
          {MORE_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="more-sheet-link" onClick={closeMoreSheet}>
              <span>{item.label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}

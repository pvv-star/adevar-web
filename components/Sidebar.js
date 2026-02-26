'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/contexts/LangContext';

const CHARTS = [
  { id: 'electricity', icon: '⚡' },
  { id: 'gas',         icon: '🔥' },
  { id: 'inflation',   icon: '📈' },
];

const COMING_SOON = [
  { id: 'fuel',        icon: '⛽' },
  { id: 'housing',     icon: '🏠' },
  { id: 'wages',       icon: '💰' },
  { id: 'food',        icon: '🛒' },
  { id: 'healthcare',  icon: '🏥' },
  { id: 'education',   icon: '🎓' },
  { id: 'transport',   icon: '🚌' },
  { id: 'gdp',         icon: '📊' },
  { id: 'exchange',    icon: '💱' },
  { id: 'unemployment',icon: '👷' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span>📊 Adevăr.md</span>
      </div>
      <div className="sidebar-nav">
        <div className="nav-section-label">{t('nav_indicators')}</div>
        {CHARTS.map((c) => (
          <Link
            key={c.id}
            href={`/chart/${c.id}`}
            className={`nav-item ${pathname === `/chart/${c.id}` ? 'active' : ''}`}
          >
            <span>{c.icon}</span>
            <span>{t(`chart_${c.id}`)}</span>
          </Link>
        ))}
        <div className="nav-section-label" style={{ marginTop: 8 }}>{t('nav_coming')}</div>
        {COMING_SOON.map((c) => (
          <Link
            key={c.id}
            href={`/chart/${c.id}`}
            className={`nav-item ${pathname === `/chart/${c.id}` ? 'active' : ''}`}
          >
            <span>{c.icon}</span>
            <span>{t(`chart_${c.id}`)}</span>
            <span className="badge">{t('soon')}</span>
          </Link>
        ))}
        <div className="nav-section-label" style={{ marginTop: 8 }}>{t('nav_pages')}</div>
        <Link href="/about" className={`nav-item ${pathname === '/about' ? 'active' : ''}`}>
          <span>ℹ️</span>
          <span>{t('nav_about')}</span>
        </Link>
      </div>
    </nav>
  );
}

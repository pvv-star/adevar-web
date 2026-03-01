'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LangContext';
import { getChartById } from '@/lib/charts';
import Link from 'next/link';

function icon(name) {
  switch (name) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      );
    case 'energy':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      );
    case 'economy':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      );
    case 'demography':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="3"/>
          <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/>
        </svg>
      );
    case 'infrastructure':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12a10 10 0 0 1 20 0"/>
          <path d="M5 12a7 7 0 0 1 14 0"/>
          <path d="M8.5 12a3.5 3.5 0 0 1 7 0"/>
          <circle cx="12" cy="16" r="1"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="12" r="1.5"/>
          <circle cx="12" cy="12" r="1.5"/>
          <circle cx="19" cy="12" r="1.5"/>
        </svg>
      );
  }
}

export default function BottomNav() {
  const { t } = useLang();
  const pathname = usePathname();
  const router = useRouter();

  const chartMatch = pathname.match(/^\/chart\/([^/]+)/);
  const chartId = chartMatch?.[1] || null;
  const chart = chartId ? getChartById(chartId) : null;
  const category = chart?.category || null;

  const baseTabs = [
    { id: 'dashboard', label: t('bnTabDashboard') || 'Dashboard', iconName: 'dashboard', href: '/', active: pathname === '/' },
    { id: 'energy', label: 'Energy', iconName: 'energy', href: '/chart/gas', active: category === 'energy' },
    { id: 'economy', label: 'Economy', iconName: 'economy', href: '/chart/inflation', active: category === 'economy' },
    { id: 'demography', label: 'Demography', iconName: 'demography', href: '/chart/births-sex', active: category === 'demography' },
    { id: 'infrastructure', label: 'Infrastructure', iconName: 'infrastructure', href: '/chart/internet', active: category === 'infrastructure' },
    { id: 'platform', label: 'Platform', iconName: 'more', href: '/about', active: pathname.startsWith('/about') || category === 'platform' },
  ];

  // Always keep one tab active on any route
  const hasActive = baseTabs.some((tab) => tab.active);
  const tabs = hasActive
    ? baseTabs
    : baseTabs.map((tab) => ({ ...tab, active: tab.id === 'platform' }));

  function onActiveTap(e, href) {
    if (pathname === href || (href.startsWith('/chart') && pathname.startsWith('/chart'))) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      router.refresh();
    }
  }

  return (
    <nav className="bottom-nav" role="tablist" aria-label="Mobile navigation categories">
      <div className="bottom-nav-inner">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={tab.active ? 'true' : 'false'}
            aria-label={`${tab.label} category`}
            className={`bn-tab${tab.active ? ' active' : ''}`}
            onClick={(e) => tab.active && onActiveTap(e, tab.href)}
          >
            {icon(tab.iconName)}
            <span className="bn-tab-label" title={tab.label}>{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

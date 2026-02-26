'use client';
import { usePathname } from 'next/navigation';
import { useLang } from '@/contexts/LangContext';
import Link from 'next/link';

export default function BottomNav() {
  const { t } = useLang();
  const pathname = usePathname();

  const isDashActive = pathname === '/' || pathname === '';
  const isEnergyActive = pathname.includes('/chart/gas') || pathname.includes('/chart/electricity') || pathname.includes('/chart/heating');
  const isEconomyActive = pathname.includes('/chart/inflation') || pathname.includes('/chart/salary') || pathname.includes('/chart/gdp') || pathname.includes('/chart/exchange') || pathname.includes('/chart/remittances');

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <div className="bottom-nav-inner">
        <Link href="/" className={`bn-tab${isDashActive ? ' active' : ''}`} style={{textDecoration:'none'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span className="bn-tab-label">{t('bnTabDashboard')}</span>
        </Link>
        <Link href="/chart/gas" className={`bn-tab${isEnergyActive ? ' active' : ''}`} style={{textDecoration:'none'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span className="bn-tab-label">{t('bnTabEnergy')}</span>
        </Link>
        <Link href="/chart/inflation" className={`bn-tab${isEconomyActive ? ' active' : ''}`} style={{textDecoration:'none'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span className="bn-tab-label">{t('bnTabEconomy')}</span>
        </Link>
        <Link href="/about" className={`bn-tab${pathname.includes('/about') ? ' active' : ''}`} style={{textDecoration:'none'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5" cy="12" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="19" cy="12" r="1.5"/>
          </svg>
          <span className="bn-tab-label">{t('bnTabMore')}</span>
        </Link>
      </div>
    </nav>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LangProvider } from '@/contexts/LangContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { getInitialNavMode, persistNavMode } from '@/lib/theme';

export default function ClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navMode, setNavMode] = useState('compact');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mode = getInitialNavMode();
    setNavMode(mode);
    setMounted(true);
  }, []);

  const isDesktop = () => typeof window !== 'undefined' && window.innerWidth > 1024;

  const handleNavToggle = useCallback(() => {
    if (isDesktop()) {
      const newMode = navMode === 'expanded' ? 'compact' : 'expanded';
      setNavMode(newMode);
      persistNavMode(newMode);
    } else {
      setSidebarOpen(prev => !prev);
    }
  }, [navMode]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <ThemeProvider>
      <LangProvider>
        <div className="app-layout">
          <Header onNavToggle={handleNavToggle} />
          <div className="app-body">
            <Sidebar
              isCompact={mounted && navMode === 'compact'}
              isOpen={sidebarOpen}
              onClose={closeSidebar}
            />
            {sidebarOpen && (
              <div
                className="sidebar-overlay show"
                onClick={closeSidebar}
              />
            )}
            <main className="main-content">
              {children}
            </main>
          </div>
          <BottomNav />
        </div>
      </LangProvider>
    </ThemeProvider>
  );
}

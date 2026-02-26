'use client';

import { useEffect } from 'react';
import { LangProvider } from '../contexts/LangContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';

export default function ClientLayout({ children }) {
  useEffect(() => {
    // Apply saved theme on mount
    try {
      const saved = window.localStorage.getItem('theme');
      if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {}
  }, []);

  return (
    <LangProvider>
      <ThemeProvider>
        <Header />
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
        <BottomNav />
      </ThemeProvider>
    </LangProvider>
  );
}

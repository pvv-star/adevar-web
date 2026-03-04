'use client';

import { useCallback, useRef, useState } from 'react';
import { useLang } from '@/contexts/LangContext';

export default function ShareButtons({ chartId, title, chartRef }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const menuRef = useRef(null);

  const chartUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/chart/${chartId}`
    : `https://www.adevar.ai/chart/${chartId}`;

  const shareText = `${title} — adevar.ai`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(chartUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = chartUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }, [chartUrl]);

  const handleTelegram = useCallback(() => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(chartUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
    setShowShareMenu(false);
  }, [chartUrl, shareText]);

  const handleWhatsApp = useCallback(() => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + chartUrl)}`, '_blank');
    setShowShareMenu(false);
  }, [chartUrl, shareText]);

  const handleGif = useCallback(async () => {
    const canvas = chartRef?.current?.canvas;
    if (!canvas || exporting) return;
    setExporting('gif');
    try {
      const { captureGif } = await import('@/lib/export-gif');
      const blob = await captureGif(canvas);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chartId}.gif`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('GIF export failed:', err);
    } finally {
      setExporting(null);
    }
  }, [chartRef, chartId, exporting]);

  const handlePdf = useCallback(async () => {
    const canvas = chartRef?.current?.canvas;
    if (!canvas || exporting) return;
    setExporting('pdf');
    try {
      const { exportPdf } = await import('@/lib/export-pdf');
      await exportPdf(canvas, { title, url: chartUrl });
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(null);
    }
  }, [chartRef, title, chartUrl, exporting]);

  // Close menu on outside click
  const handleMenuToggle = useCallback(() => {
    setShowShareMenu((prev) => {
      if (!prev) {
        const close = (e) => {
          if (menuRef.current && !menuRef.current.contains(e.target)) {
            setShowShareMenu(false);
            document.removeEventListener('click', close);
          }
        };
        setTimeout(() => document.addEventListener('click', close), 0);
      }
      return !prev;
    });
  }, []);

  return (
    <div className="share-buttons">
      {/* Share link dropdown */}
      <div className="share-btn-wrap" ref={menuRef}>
        <button
          className="share-btn"
          onClick={handleMenuToggle}
          title={t('shareLink') || 'Share link'}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>
        {showShareMenu && (
          <div className="share-dropdown">
            <button className="share-dropdown-item" onClick={handleTelegram} type="button">
              <span className="share-dropdown-icon">✈</span>
              Telegram
            </button>
            <button className="share-dropdown-item" onClick={handleWhatsApp} type="button">
              <span className="share-dropdown-icon">💬</span>
              WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* GIF export */}
      <button
        className="share-btn"
        onClick={handleGif}
        disabled={!!exporting}
        title={t('exportGif') || 'Export GIF'}
        type="button"
      >
        {exporting === 'gif' ? (
          <span className="share-spinner" />
        ) : (
          <span className="share-badge">GIF</span>
        )}
      </button>

      {/* PDF export */}
      <button
        className="share-btn"
        onClick={handlePdf}
        disabled={!!exporting}
        title={t('exportPdf') || 'Export PDF'}
        type="button"
      >
        {exporting === 'pdf' ? (
          <span className="share-spinner" />
        ) : (
          <span className="share-badge">PDF</span>
        )}
      </button>

      {/* Copy link */}
      <button
        className="share-btn"
        onClick={handleCopy}
        title={copied ? (t('copied') || 'Copied!') : (t('copyLink') || 'Copy link')}
        type="button"
      >
        {copied ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}

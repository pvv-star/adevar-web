'use client';
import { useMemo, useRef, useEffect, useCallback } from 'react';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { initChart } from '@/lib/engine';

export default function ChartCanvas({ config, eras }) {
  const canvasRef = useRef(null);
  const cleanupRef = useRef(null);
  const apiRef = useRef(null);
  const { lang, t } = useLang();
  const { theme } = useTheme();
  const effectiveConfig = useMemo(() => config || {}, [config]);


  const mount = useCallback(() => {
    if (!canvasRef.current) return;
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    const result = initChart(canvasRef.current, effectiveConfig, eras, lang, theme);
    // initChart returns cleanup function; store API if returned as object
    if (typeof result === 'function') {
      cleanupRef.current = result;
    } else if (result && typeof result.cleanup === 'function') {
      cleanupRef.current = result.cleanup;
      apiRef.current = result;
    }
  }, [effectiveConfig, eras, lang, theme]);

  useEffect(() => {
    mount();
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
        apiRef.current = null;
      }
    };
  }, [mount]);

  const chartLabel = config?.i18n?.[lang]?.title || config?.i18n?.ro?.title || t('dataChart');
  const chartUnit = config?.unit || '';

  // Build sr-only data table for screen readers
  const dataRows = config?.data || [];

  return (
    <div className="chart-section">
      <div className="chart-container">
        <div className="chart-header">
          <h1 id="chartTitle">{config?.i18n?.[lang]?.title || config?.i18n?.ro?.title || ''}</h1>
          <p id="chartSubtitle">{config?.i18n?.[lang]?.subtitle || config?.i18n?.ro?.subtitle || ''}</p>
        </div>


        <div className="chart-wrap">
          <canvas
            ref={canvasRef}
            id="chart"
            role="img"
            aria-label={`${chartLabel} — ${chartUnit}`}
          ></canvas>
          <div className="tooltip" id="tooltip"></div>
          <div className="price-pill" id="pricePill"></div>
        </div>

        <div className="extra-widget" id="extraWidget"></div>

        {dataRows.length > 0 && (
          <table className="sr-only">
            <caption>{chartLabel}</caption>
            <thead>
              <tr>
                <th scope="col">{t('chartPeriod')}</th>
                <th scope="col">{t('chartValue')} ({chartUnit})</th>
              </tr>
            </thead>
            <tbody>
              {dataRows.map((d, i) => (
                <tr key={i}>
                  <td>{d.label}</td>
                  <td>{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

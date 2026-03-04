'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import ComingSoon from '@/components/ComingSoon';
import ShareButtons from '@/components/ShareButtons';
import ChartRelatedNews from '@/components/ChartRelatedNews';
import { useLang } from '@/contexts/LangContext';

// Dynamically import ChartCanvas to avoid SSR issues with canvas
const ChartCanvas = dynamic(() => import('@/components/ChartCanvas'), {
  ssr: false,
  loading: () => (
    <div className="page-scroll">
      <div style={{ padding: '32px', maxWidth: '920px', margin: '0 auto' }}>
        <div className="skel-row" style={{ marginBottom: '16px' }}>
          <div className="skel-bar skel-stat"></div>
          <div className="skel-bar skel-stat"></div>
          <div className="skel-bar skel-stat"></div>
          <div className="skel-bar skel-stat"></div>
        </div>
        <div className="skel-bar skel-chart"></div>
        <div className="skel-bar skel-events" style={{ marginTop: '12px' }}></div>
      </div>
    </div>
  ),
});

export default function ChartPageClient({ chart, chartData }) {
  const chartRef = useRef(null);
  const { lang } = useLang();

  if (!chartData || chart.soon) {
    return <ComingSoon chart={chart} />;
  }

  const title = chart[lang] || chart.ro;

  return (
    <div className="chart-page-with-news">
      <div className="chart-page-main">
        <ShareButtons
          chartId={chart.id}
          title={title}
          chartRef={chartRef}
        />
        <ChartCanvas
          ref={chartRef}
          config={chartData.config}
          eras={chartData.eras}
        />
      </div>
      <ChartRelatedNews chartSlug={chart.id} />
    </div>
  );
}

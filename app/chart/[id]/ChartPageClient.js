'use client';
import dynamic from 'next/dynamic';
import ComingSoon from '@/components/ComingSoon';
import BirthsSexChart from '@/components/BirthsSexChart';

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
  if (chart?.id === 'births-sex') {
    return <BirthsSexChart data={chartData} title={chart?.ro || 'Births by Sex'} />;
  }

  if (!chartData || chart.soon) {
    return <ComingSoon chart={chart} />;
  }

  return (
    <ChartCanvas
      config={chartData.config}
      eras={chartData.eras}
    />
  );
}

import { ImageResponse } from 'next/og';
import { getChartById, getChartData } from '@/lib/charts';

export const runtime = 'edge';

export async function GET(request, { params }) {
  const { id } = await params;
  const chart = getChartById(id);

  if (!chart) {
    return new Response('Not found', { status: 404 });
  }

  const title = chart.ro;
  const desc = chart.desc?.ro || '';

  let latestValue = '';
  let unit = '';
  try {
    const data = chart.file ? await getChartData(id) : null;
    const points = data?.config?.data;
    if (points?.length) {
      const last = points[points.length - 1];
      latestValue = String(last.value);
      unit = data.config.unit || '';
    }
  } catch {
    // render without value
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(145deg, #111318 0%, #1a1d27 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '4px', height: '48px', background: '#0d9488', borderRadius: '2px' }} />
            <span style={{ fontSize: '52px', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
              {title}
            </span>
          </div>

          {latestValue && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '96px', fontWeight: 800, color: '#2dd4bf', lineHeight: 1 }}>
                {latestValue}
              </span>
              <span style={{ fontSize: '32px', fontWeight: 500, color: '#919191' }}>
                {unit}
              </span>
            </div>
          )}

          {desc && (
            <span style={{ fontSize: '22px', fontWeight: 400, color: '#8890a4', maxWidth: '800px', lineHeight: 1.4 }}>
              {desc}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '36px', fontWeight: 800, color: '#ffffff' }}>adevar</span>
            <span style={{ fontSize: '36px', fontWeight: 800, color: '#2dd4bf' }}>.</span>
            <span style={{ fontSize: '36px', fontWeight: 500, color: '#919191' }}>ai</span>
          </div>
          <span style={{ fontSize: '18px', color: '#6b6b6b' }}>
            Surse oficiale: BNS · ANRE · BNM
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

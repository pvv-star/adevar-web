import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'adevar.ai — Republica Moldova Date în Timp Real';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#111318',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '24px' }}>
          <span style={{ fontSize: '72px', fontWeight: 800, color: '#ffffff' }}>adevar</span>
          <span style={{ fontSize: '72px', fontWeight: 800, color: '#2dd4bf' }}>.</span>
          <span style={{ fontSize: '72px', fontWeight: 500, color: '#919191' }}>ai</span>
        </div>
        <div style={{ fontSize: '28px', fontWeight: 400, color: '#c8c8c8', marginBottom: '20px' }}>
          Republica Moldova — Date în Timp Real
        </div>
        <div style={{ fontSize: '20px', fontWeight: 400, color: '#6b6b6b', marginBottom: '120px' }}>
          Surse oficiale: BNS · ANRE · BNM
        </div>
        <div style={{ width: '200px', height: '3px', background: '#2dd4bf' }} />
      </div>
    ),
    { ...size }
  );
}

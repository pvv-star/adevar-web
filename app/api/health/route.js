import { NextResponse } from 'next/server';
import { getIndicatorSeriesBySlug } from '@/services/indicators';

export async function GET() {
  const now = new Date().toISOString();

  try {
    const result = await getIndicatorSeriesBySlug('inflation', { from: 2018 });

    return NextResponse.json(
      {
        ok: true,
        service: 'adevar-api',
        timestamp: now,
        checks: {
          db: 'ok',
          inflationStrategy: result.matchStrategy,
          inflationPoints: result.count ?? result.series?.length ?? 0,
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: 'adevar-api',
        timestamp: now,
        checks: { db: 'fail' },
        error: error?.message || 'health-check-failed',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

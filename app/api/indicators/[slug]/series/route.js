import { NextResponse } from 'next/server';
import { getIndicatorSeriesBySlug } from '@/services/indicators';
import { applyRateLimit, clientIp } from '@/lib/server-rate-limit';

export async function GET(request, { params }) {
  const rl = applyRateLimit(`indicator-series:${clientIp(request)}`, { limit: 120, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    if (!/^[a-z0-9-_]+$/i.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const result = await getIndicatorSeriesBySlug(slug, { from, to });

    if (result.matchStrategy === 'not-found') {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (err) {
    console.error('[api] indicator-series failed:', err?.message || err);
    return NextResponse.json(
      {
        error: 'Failed to load indicator series',
      },
      { status: 500 }
    );
  }
}

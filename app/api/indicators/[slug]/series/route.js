import { NextResponse } from 'next/server';
import { getIndicatorSeriesBySlug } from '@/services/indicators';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const result = await getIndicatorSeriesBySlug(slug, { from, to });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load indicator series',
        details: error?.message || 'unknown-error',
      },
      { status: 500 }
    );
  }
}

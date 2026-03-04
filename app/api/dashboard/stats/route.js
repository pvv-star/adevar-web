import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/services/dashboard-stats';
import { applyRateLimit, clientIp } from '@/lib/server-rate-limit';

export async function GET(request) {
  const rl = applyRateLimit(`dash:${clientIp(request)}`, { limit: 120, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  try {
    const payload = await getDashboardStats();
    return NextResponse.json(payload, {
      status: 200,
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('[api] dashboard-stats failed:', err?.message || err);
    return NextResponse.json(
      { error: 'Failed to load dashboard stats' },
      { status: 500 }
    );
  }
}

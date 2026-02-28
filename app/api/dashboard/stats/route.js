import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/services/dashboard-stats';

export async function GET() {
  try {
    const payload = await getDashboardStats();
    return NextResponse.json(payload, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load dashboard stats',
        details: error?.message || 'unknown-error',
      },
      { status: 500 }
    );
  }
}

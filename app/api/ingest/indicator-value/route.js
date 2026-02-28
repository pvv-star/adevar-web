import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { validateIngestionPayload } from '@/lib/ingestion-validation';
import { logDataChange } from '@/lib/data-change-log';

export async function POST(request) {
  try {
    const body = await request.json();
    const dryRun = Boolean(body?.dryRun);

    const validation = validateIngestionPayload(body);
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, error: 'validation_failed', details: validation.errors },
        { status: 400 }
      );
    }

    const { slug, year, value, reason, changedBy } = validation.normalized;

    const supabase = getSupabaseServerClient();
    const indicatorRes = await supabase
      .from('indicators')
      .select('id, slug, name')
      .eq('slug', slug)
      .maybeSingle();

    if (indicatorRes.error) {
      throw new Error(indicatorRes.error.message);
    }

    if (!indicatorRes.data) {
      return NextResponse.json({ ok: false, error: `indicator_not_found:${slug}` }, { status: 404 });
    }

    const indicator = indicatorRes.data;

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        mode: 'dry-run',
        target: { indicatorId: indicator.id, slug: indicator.slug, year, value },
      });
    }

    const upsertRes = await supabase
      .from('indicator_values')
      .upsert(
        [{ indicator_id: indicator.id, year, value }],
        { onConflict: 'indicator_id,year' }
      )
      .select('indicator_id, year, value')
      .single();

    if (upsertRes.error) {
      throw new Error(upsertRes.error.message);
    }

    await logDataChange({
      tableName: 'indicator_values',
      recordKey: `${indicator.id}:${year}`,
      action: 'upsert',
      changedBy,
      reason,
      payload: {
        slug: indicator.slug,
        year,
        value,
      },
    });

    return NextResponse.json({
      ok: true,
      mode: 'write',
      data: upsertRes.data,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'ingest_failed' },
      { status: 500 }
    );
  }
}

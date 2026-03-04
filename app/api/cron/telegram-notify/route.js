import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { sendMessage, formatIndicatorUpdate } from '@/lib/telegram';

export const maxDuration = 30;

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) {
    return NextResponse.json({ error: 'TELEGRAM_CHANNEL_ID not configured' }, { status: 500 });
  }

  const supabase = getSupabaseServerClient();

  // Fetch latest value per indicator (most recent year)
  const { data: indicators, error: indErr } = await supabase
    .from('indicators')
    .select('id, name, unit, slug')
    .eq('is_official', true)
    .order('name');

  if (indErr) {
    return NextResponse.json({ error: indErr.message }, { status: 500 });
  }

  const changes = [];

  for (const ind of indicators) {
    const { data: values } = await supabase
      .from('indicator_values')
      .select('year, value')
      .eq('indicator_id', ind.id)
      .order('year', { ascending: false })
      .limit(2);

    if (!values || values.length === 0) continue;

    const latest = values[0];
    const previous = values.length > 1 ? values[1] : null;

    changes.push({
      name: ind.name,
      unit: ind.unit || '',
      year: latest.year,
      value: Number(latest.value),
      oldValue: previous ? Number(previous.value) : null,
    });
  }

  if (changes.length === 0) {
    return NextResponse.json({ ok: true, sent: false, reason: 'no_indicators' });
  }

  const text = formatIndicatorUpdate(changes);

  try {
    const result = await sendMessage(channelId, text);
    return NextResponse.json({ ok: true, sent: true, messageId: result.result?.message_id });
  } catch (err) {
    console.error('[telegram-notify]', err.message);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

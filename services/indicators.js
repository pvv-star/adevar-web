import { getSupabaseServerClient } from '@/lib/supabase-server';

function normalizeSeriesRows(rows = []) {
  return rows
    .map((row) => ({ year: Number(row.year), value: Number(row.value) }))
    .filter((row) => Number.isFinite(row.year) && Number.isFinite(row.value))
    .sort((a, b) => a.year - b.year);
}

export async function getIndicatorSeriesBySlug(slug, { from, to } = {}) {
  const supabase = getSupabaseServerClient();

  const parsedFrom = Number(from);
  const parsedTo = Number(to);

  const yearFrom = Number.isFinite(parsedFrom) ? parsedFrom : 2018;
  const yearTo = Number.isFinite(parsedTo) ? parsedTo : new Date().getFullYear();

  // Path A: relation join by slug (preferred)
  const joined = await supabase
    .from('indicator_values')
    .select('year, value, indicators!inner(slug)')
    .eq('indicators.slug', slug)
    .gte('year', yearFrom)
    .lte('year', yearTo)
    .order('year', { ascending: true });

  if (!joined.error && joined.data?.length) {
    return {
      slug,
      from: yearFrom,
      to: yearTo,
      matchStrategy: 'join-by-slug',
      series: normalizeSeriesRows(joined.data),
    };
  }

  // Path B: find indicator id by slug (or fuzzy fallback) then query values
  const exact = await supabase
    .from('indicators')
    .select('id, slug, name')
    .eq('slug', slug)
    .maybeSingle();

  let indicator = exact.data;

  if (!indicator) {
    const fuzzy = await supabase
      .from('indicators')
      .select('id, slug, name')
      .or(`slug.ilike.%${slug}%,name.ilike.%${slug}%`)
      .limit(1)
      .maybeSingle();

    indicator = fuzzy.data;
  }

  if (!indicator) {
    return {
      slug,
      from: yearFrom,
      to: yearTo,
      matchStrategy: 'not-found',
      series: [],
    };
  }

  const values = await supabase
    .from('indicator_values')
    .select('year, value')
    .eq('indicator_id', indicator.id)
    .gte('year', yearFrom)
    .lte('year', yearTo)
    .order('year', { ascending: true });

  if (values.error) {
    throw new Error(values.error.message);
  }

  return {
    slug: indicator.slug || slug,
    from: yearFrom,
    to: yearTo,
    matchStrategy: exact.data ? 'indicator-id-exact' : 'indicator-id-fuzzy',
    series: normalizeSeriesRows(values.data),
  };
}

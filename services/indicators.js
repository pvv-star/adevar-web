import { getSupabaseServerClient } from '@/lib/supabase-server';

function normalizeSeriesRows(rows = []) {
  return rows
    .map((row) => ({ year: Number(row.year), value: Number(row.value) }))
    .filter((row) => Number.isFinite(row.year) && Number.isFinite(row.value))
    .sort((a, b) => a.year - b.year);
}

function clampYears(from, to) {
  const currentYear = new Date().getFullYear();
  const minYear = 1990;

  const parsedFrom = Number(from);
  const parsedTo = Number(to);

  let yearFrom = Number.isFinite(parsedFrom) ? parsedFrom : 2018;
  let yearTo = Number.isFinite(parsedTo) ? parsedTo : currentYear;

  yearFrom = Math.max(minYear, Math.min(yearFrom, currentYear));
  yearTo = Math.max(minYear, Math.min(yearTo, currentYear));

  if (yearFrom > yearTo) {
    [yearFrom, yearTo] = [yearTo, yearFrom];
  }

  return { yearFrom, yearTo };
}

function buildResponse({ slug, from, to, matchStrategy, series, indicator }) {
  const normalized = normalizeSeriesRows(series);
  return {
    slug: indicator?.slug || slug,
    from,
    to,
    matchStrategy,
    count: normalized.length,
    lastUpdated: normalized.length ? normalized[normalized.length - 1].year : null,
    indicator: indicator
      ? {
          id: indicator.id,
          name: indicator.name || null,
        }
      : null,
    series: normalized,
  };
}

export async function getIndicatorSeriesBySlug(slug, { from, to } = {}) {
  const supabase = getSupabaseServerClient();
  const { yearFrom, yearTo } = clampYears(from, to);

  // Path A: relation join by slug (preferred)
  const joined = await supabase
    .from('indicator_values')
    .select('year, value, indicators!inner(id, slug, name)')
    .eq('indicators.slug', slug)
    .gte('year', yearFrom)
    .lte('year', yearTo)
    .order('year', { ascending: true });

  if (!joined.error && joined.data?.length) {
    const indicator = joined.data[0]?.indicators || null;
    return buildResponse({
      slug,
      from: yearFrom,
      to: yearTo,
      matchStrategy: 'join-by-slug',
      series: joined.data,
      indicator,
    });
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
    return buildResponse({
      slug,
      from: yearFrom,
      to: yearTo,
      matchStrategy: 'not-found',
      series: [],
      indicator: null,
    });
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

  return buildResponse({
    slug,
    from: yearFrom,
    to: yearTo,
    matchStrategy: exact.data ? 'indicator-id-exact' : 'indicator-id-fuzzy',
    series: values.data,
    indicator,
  });
}

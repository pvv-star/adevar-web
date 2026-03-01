import { getSupabaseReadClient } from '@/lib/supabase-server';

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
          sourceName: indicator.source_name || null,
          sourceUrl: indicator.source_url || null,
          methodology: indicator.methodology || null,
          updateFrequency: indicator.update_frequency || null,
          coverageStartYear: indicator.coverage_start_year || null,
          coverageEndYear: indicator.coverage_end_year || null,
          unit: indicator.unit || null,
          isOfficial: indicator.is_official ?? null,
        }
      : null,
    series: normalized,
  };
}

export async function getIndicatorSeriesBySlug(slug, { from, to } = {}) {
  const supabase = getSupabaseReadClient();
  const { yearFrom, yearTo } = clampYears(from, to);

  // Path A: relation join by slug (preferred)
  const joined = await supabase
    .from('indicator_values')
    .select('year, value, indicators!inner(id, slug, name, source_name, source_url, methodology, update_frequency, coverage_start_year, coverage_end_year, unit, is_official)')
    .eq('indicators.slug', slug)
    .gte('year', yearFrom)
    .lte('year', yearTo)
    .order('year', { ascending: true });

  if (joined.error) {
    throw new Error(joined.error.message);
  }

  if (joined.data?.length) {
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

  if (exact.error) {
    throw new Error(exact.error.message);
  }

  let indicator = exact.data;

  if (!indicator) {
    const safeFuzzy = String(slug || '')
      .toLowerCase()
      .replace(/[^a-z0-9-_\s]/g, '')
      .trim()
      .slice(0, 64);

    if (safeFuzzy) {
      const fuzzyBySlug = await supabase
        .from('indicators')
        .select('id, slug, name, source_name, source_url, methodology, update_frequency, coverage_start_year, coverage_end_year, unit, is_official')
        .ilike('slug', `%${safeFuzzy}%`)
        .limit(1)
        .maybeSingle();

      if (fuzzyBySlug.error) {
        throw new Error(fuzzyBySlug.error.message);
      }

      indicator = fuzzyBySlug.data;

      if (!indicator) {
        const fuzzyByName = await supabase
          .from('indicators')
          .select('id, slug, name, source_name, source_url, methodology, update_frequency, coverage_start_year, coverage_end_year, unit, is_official')
          .ilike('name', `%${safeFuzzy}%`)
          .limit(1)
          .maybeSingle();

        if (fuzzyByName.error) {
          throw new Error(fuzzyByName.error.message);
        }

        indicator = fuzzyByName.data;
      }
    }
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

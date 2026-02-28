export async function fetchIndicatorSeries(slug, { from = 2018, to = new Date().getFullYear() } = {}) {
  const params = new URLSearchParams({ from: String(from), to: String(to) });
  const res = await fetch(`/api/indicators/${slug}/series?${params.toString()}`, {
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.details || data?.error || `Failed to fetch ${slug}`);
  }

  return data;
}
